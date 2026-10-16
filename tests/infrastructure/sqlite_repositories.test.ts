import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteConnectionFactory } from '@/infrastructure/database/sqlite_client';
import { SQLiteExerciseRepository } from '@/infrastructure/repositories/SQLiteExerciseRepository';
import { SQLiteWorkoutTemplateRepository } from '@/infrastructure/repositories/SQLiteWorkoutTemplateRepository';
import { SQLiteStagingSessionRepository } from '@/infrastructure/repositories/SQLiteStagingSessionRepository';
import { SQLitePermanentWorkoutRepository } from '@/infrastructure/repositories/SQLitePermanentWorkoutRepository';
import { Exercise } from '@/domain/entities/Exercise';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';
import { WorkoutSession } from '@/domain/entities/WorkoutSession';
import { WorkoutSet } from '@/domain/entities/WorkoutSet';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';

describe('Infrastructure SQLite Repositories', () => {
  let stagingDb: Database.Database;
  let permanentDb: Database.Database;

  beforeEach(() => {
    stagingDb = SQLiteConnectionFactory.getStagingDb(':memory:');
    permanentDb = SQLiteConnectionFactory.getPermanentDb(':memory:');
  });

  it('saves and retrieves exercises', async () => {
    const repo = new SQLiteExerciseRepository(permanentDb);
    const ex = Exercise.create({
      id: 'ex-squat',
      name: 'Barbell Squat',
      muscleMultipliers: new Map([[MuscleGroup.QUADRICEPS, 1.0], [MuscleGroup.GLUTES, 0.6]]),
      imagePath: '/exercises/squat.svg',
    });

    await repo.save(ex);
    const retrieved = await repo.findById('ex-squat');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Barbell Squat');
    expect(retrieved?.getMultiplierFor(MuscleGroup.QUADRICEPS)).toBe(1.0);
    expect(retrieved?.getMultiplierFor(MuscleGroup.GLUTES)).toBe(0.6);
  });

  it('saves and finds templates by exercise IDs', async () => {
    const repo = new SQLiteWorkoutTemplateRepository(permanentDb);
    const template = WorkoutTemplate.create({
      id: 'tpl-leg-day',
      name: 'Leg Day',
      items: [
        { exerciseId: 'ex-squat', plannedSets: 4 },
        { exerciseId: 'ex-leg-press', plannedSets: 3 },
      ],
    });

    await repo.save(template);
    const found = await repo.findByExerciseIds(['ex-leg-press', 'ex-squat']);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Leg Day');
  });

  it('saves active session draft in staging DB and handles in-memory typo updates', async () => {
    const stagingRepo = new SQLiteStagingSessionRepository(stagingDb);
    const session = WorkoutSession.create({
      id: 'sess-staging-1',
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    const set1 = WorkoutSet.create({
      id: 'set-1',
      exerciseId: 'ex-squat',
      setNumber: 1,
      weight: Weight.create(100),
      repetitions: Repetitions.create(8),
      warmup: Warmup.create(false),
      startedAt: new Date('2026-10-15T10:00:00Z'),
      completedAt: new Date('2026-10-15T10:00:45Z'),
    });

    session.addSet(set1);
    await stagingRepo.saveDraft(session);

    // Verify persisted in staging DB
    const loaded = await stagingRepo.findActiveById('sess-staging-1');
    expect(loaded).not.toBeNull();
    expect(loaded?.sets.length).toBe(1);
    expect(loaded?.sets[0].weight.value).toBe(100);

    // Typo update
    loaded?.updateSet('set-1', { weight: Weight.create(110) });
    await stagingRepo.saveDraft(loaded!);

    const reloaded = await stagingRepo.findActiveById('sess-staging-1');
    expect(reloaded?.sets[0].weight.value).toBe(110);
  });

  it('saves completed session into permanent DB', async () => {
    const permanentRepo = new SQLitePermanentWorkoutRepository(permanentDb);
    const session = WorkoutSession.create({
      id: 'sess-perm-1',
      startedAt: new Date('2026-10-15T10:00:00Z'),
    });

    session.addSet(
      WorkoutSet.create({
        id: 'set-1',
        exerciseId: 'ex-squat',
        setNumber: 1,
        weight: Weight.create(100),
        repetitions: Repetitions.create(10),
        warmup: Warmup.create(false),
        startedAt: new Date('2026-10-15T10:00:00Z'),
        completedAt: new Date('2026-10-15T10:00:45Z'),
      })
    );

    session.complete(new Date('2026-10-15T10:45:00Z'));
    await permanentRepo.saveCompletedSession(session);

    const history = await permanentRepo.findAll();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe('sess-perm-1');
    expect(history[0].sets.length).toBe(1);
  });
});
