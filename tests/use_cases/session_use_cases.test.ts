import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteConnectionFactory } from '@/infrastructure/database/sqlite_client';
import { SQLiteExerciseRepository } from '@/infrastructure/repositories/SQLiteExerciseRepository';
import { SQLiteWorkoutTemplateRepository } from '@/infrastructure/repositories/SQLiteWorkoutTemplateRepository';
import { SQLiteStagingSessionRepository } from '@/infrastructure/repositories/SQLiteStagingSessionRepository';
import { SQLitePermanentWorkoutRepository } from '@/infrastructure/repositories/SQLitePermanentWorkoutRepository';

import { StartWorkoutSession } from '@/use_cases/session/StartWorkoutSession';
import { LogCompletedSet } from '@/use_cases/session/LogCompletedSet';
import { EditActiveSet } from '@/use_cases/session/EditActiveSet';
import { CompleteWorkoutSession } from '@/use_cases/session/CompleteWorkoutSession';
import { CalculateMuscleImpact } from '@/use_cases/metrics/CalculateMuscleImpact';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import { Exercise } from '@/domain/entities/Exercise';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';

describe('Use Cases', () => {
  let stagingDb: Database.Database;
  let permanentDb: Database.Database;
  let exerciseRepo: SQLiteExerciseRepository;
  let templateRepo: SQLiteWorkoutTemplateRepository;
  let stagingRepo: SQLiteStagingSessionRepository;
  let permanentRepo: SQLitePermanentWorkoutRepository;

  beforeEach(async () => {
    stagingDb = SQLiteConnectionFactory.getStagingDb(':memory:');
    permanentDb = SQLiteConnectionFactory.getPermanentDb(':memory:');
    exerciseRepo = new SQLiteExerciseRepository(permanentDb);
    templateRepo = new SQLiteWorkoutTemplateRepository(permanentDb);
    stagingRepo = new SQLiteStagingSessionRepository(stagingDb);
    permanentRepo = new SQLitePermanentWorkoutRepository(permanentDb);

    // Seed test exercises
    await exerciseRepo.save(
      Exercise.create({
        id: 'ex-bench-press',
        name: 'Bench Press',
        muscleMultipliers: new Map([[MuscleGroup.CHEST, 1.0], [MuscleGroup.TRICEPS, 0.4]]),
      })
    );
    await exerciseRepo.save(
      Exercise.create({
        id: 'ex-incline-dumbbell',
        name: 'Incline Dumbbell Press',
        muscleMultipliers: new Map([[MuscleGroup.CHEST, 0.8], [MuscleGroup.SHOULDERS, 0.4]]),
      })
    );
    await exerciseRepo.save(
      Exercise.create({
        id: 'ex-pec-deck',
        name: 'Pec Deck Fly',
        muscleMultipliers: new Map([[MuscleGroup.CHEST, 0.9]]),
      })
    );

    // Seed original template: Bench Press & Pec Deck
    await templateRepo.save(
      WorkoutTemplate.create({
        id: 'tpl-chest-original',
        name: 'Chest Routine A',
        items: [
          { exerciseId: 'ex-bench-press', plannedSets: 3 },
          { exerciseId: 'ex-pec-deck', plannedSets: 3 },
        ],
      })
    );
  });

  it('orchestrates starting a session, logging sets with rest calculation, and staging', async () => {
    const startSession = new StartWorkoutSession(stagingRepo);
    const session = await startSession.execute({
      templateId: 'tpl-chest-original',
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    expect(session.id).toBeDefined();

    const logSet = new LogCompletedSet(stagingRepo);

    // Set 1
    const res1 = await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 10,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:00:00Z'),
      completedAt: new Date('2026-10-15T10:00:40Z'),
    });

    expect(res1.session.sets.length).toBe(1);
    expect(res1.loggedSet.restTimeBeforeThisSet).toBeUndefined();

    // Set 2 (10:02:00 -> 80s rest elapsed)
    const res2 = await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 8,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:02:00Z'),
      completedAt: new Date('2026-10-15T10:02:40Z'),
    });

    expect(res2.session.sets.length).toBe(2);
    expect(res2.loggedSet.restTimeBeforeThisSet?.seconds).toBe(80);
  });

  it('handles the typo edge case by editing an active set and updating staging', async () => {
    const startSession = new StartWorkoutSession(stagingRepo);
    const session = await startSession.execute({
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    const logSet = new LogCompletedSet(stagingRepo);
    const { loggedSet } = await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 10,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:00:00Z'),
      completedAt: new Date('2026-10-15T10:00:40Z'),
    });

    const editSet = new EditActiveSet(stagingRepo);
    const updated = await editSet.execute({
      sessionId: session.id,
      setId: loggedSet.id,
      weight: 85,
      reps: 12,
      isWarmup: true,
    });

    expect(updated.sets[0].weight.value).toBe(85);
    expect(updated.sets[0].repetitions.value).toBe(12);
    expect(updated.sets[0].warmup.isWarmup).toBe(true);

    // Also check staging DB directly
    const reloaded = await stagingRepo.findActiveById(session.id);
    expect(reloaded?.sets[0].weight.value).toBe(85);
  });

  it('handles changing plans edge case: completes session, adapts templates, flushes to permanent DB', async () => {
    const startSession = new StartWorkoutSession(stagingRepo);
    const session = await startSession.execute({
      templateId: 'tpl-chest-original', // Bench Press + Pec Deck
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    const logSet = new LogCompletedSet(stagingRepo);

    // Bench press done
    await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 10,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:00:00Z'),
      completedAt: new Date('2026-10-15T10:00:40Z'),
    });

    // Instead of Pec Deck, user did Incline Dumbbell because machine was busy
    await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-incline-dumbbell',
      weight: 30,
      reps: 12,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:03:00Z'),
      completedAt: new Date('2026-10-15T10:03:45Z'),
    });

    const completeSession = new CompleteWorkoutSession(stagingRepo, permanentRepo, templateRepo);
    const completed = await completeSession.execute({
      sessionId: session.id,
      completedAt: new Date('2026-10-15T10:45:00Z'),
    });

    expect(completed.status).toBe('COMPLETED');
    expect(completed.templateId).not.toBe('tpl-chest-original'); // Reconciled!

    // Verify it created a new matching template
    const newTemplate = await templateRepo.findById(completed.templateId!);
    expect(newTemplate).not.toBeNull();
    expect(newTemplate?.hasExercise('ex-bench-press')).toBe(true);
    expect(newTemplate?.hasExercise('ex-incline-dumbbell')).toBe(true);
    expect(newTemplate?.hasExercise('ex-pec-deck')).toBe(false);

    // Staging must be cleared
    const stagingDraft = await stagingRepo.findActiveById(session.id);
    expect(stagingDraft).toBeNull();

    // Permanent DB has it
    const permRecord = await permanentRepo.findById(session.id);
    expect(permRecord).not.toBeNull();
  });

  it('calculates muscle impact accurately excluding warmup sets', async () => {
    const session = await new StartWorkoutSession(stagingRepo).execute({
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    const logSet = new LogCompletedSet(stagingRepo);
    // Warmup set (should be ignored for stats)
    await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 40,
      reps: 15,
      isWarmup: true,
      startedAt: new Date('2026-10-15T10:00:00Z'),
      completedAt: new Date('2026-10-15T10:00:30Z'),
    });

    // Working set 1: 80kg x 10 reps (Bench: Chest = 1.0, Triceps = 0.4)
    await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 10,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:02:00Z'),
      completedAt: new Date('2026-10-15T10:02:40Z'),
    });

    // Working set 2: 80kg x 10 reps
    await logSet.execute({
      sessionId: session.id,
      exerciseId: 'ex-bench-press',
      weight: 80,
      reps: 10,
      isWarmup: false,
      startedAt: new Date('2026-10-15T10:04:00Z'),
      completedAt: new Date('2026-10-15T10:04:40Z'),
    });

    const completeSession = new CompleteWorkoutSession(stagingRepo, permanentRepo, templateRepo);
    await completeSession.execute({
      sessionId: session.id,
      completedAt: new Date('2026-10-15T10:30:00Z'),
    });

    const calculateImpact = new CalculateMuscleImpact(permanentRepo, exerciseRepo);
    const impactResult = await calculateImpact.execute({
      startDate: new Date('2026-10-15T00:00:00Z'),
      endDate: new Date('2026-10-15T23:59:59Z'),
    });

    // 2 working sets * 10 reps * 80kg = 1600 total raw work
    // Chest multiplier = 1.0 => 1600
    // Triceps multiplier = 0.4 => 640
    expect(impactResult.get(MuscleGroup.CHEST)).toBe(1600);
    expect(impactResult.get(MuscleGroup.TRICEPS)).toBe(640);
    expect(impactResult.get(MuscleGroup.QUADRICEPS) || 0).toBe(0);
  });
});
