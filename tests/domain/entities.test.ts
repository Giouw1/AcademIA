import { describe, it, expect } from 'vitest';
import { Exercise } from '@/domain/entities/Exercise';
import { WorkoutSet } from '@/domain/entities/WorkoutSet';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';
import { WorkoutSession, WorkoutSessionStatus } from '@/domain/entities/WorkoutSession';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';

describe('Domain Entities', () => {
  describe('Exercise', () => {
    it('creates exercise with target muscle group multipliers', () => {
      const multipliers = new Map<MuscleGroup, number>([
        [MuscleGroup.CHEST, 1.0],
        [MuscleGroup.TRICEPS, 0.4],
        [MuscleGroup.SHOULDERS, 0.3],
      ]);
      const ex = Exercise.create({
        id: 'ex-bench-press',
        name: 'Bench Press',
        muscleMultipliers: multipliers,
        imagePath: '/exercises/bench_press.png',
      });

      expect(ex.id).toBe('ex-bench-press');
      expect(ex.name).toBe('Bench Press');
      expect(ex.getMultiplierFor(MuscleGroup.CHEST)).toBe(1.0);
      expect(ex.getMultiplierFor(MuscleGroup.BICEPS)).toBe(0);
    });
  });

  describe('WorkoutSet', () => {
    it('instantiates a workout set and allows updating reps and weight during active session', () => {
      const set = WorkoutSet.create({
        id: 'set-1',
        exerciseId: 'ex-bench-press',
        setNumber: 1,
        weight: Weight.create(80),
        repetitions: Repetitions.create(10),
        warmup: Warmup.create(false),
        startedAt: new Date('2026-10-15T10:00:00Z'),
        completedAt: new Date('2026-10-15T10:00:45Z'),
      });

      expect(set.weight.value).toBe(80);
      expect(set.repetitions.value).toBe(10);
      expect(set.warmup.isWarmup).toBe(false);

      // Typo handling
      set.updateWeight(Weight.create(85));
      set.updateRepetitions(Repetitions.create(12));
      set.updateWarmup(Warmup.create(true));

      expect(set.weight.value).toBe(85);
      expect(set.repetitions.value).toBe(12);
      expect(set.warmup.isWarmup).toBe(true);
    });
  });

  describe('WorkoutTemplate', () => {
    it('creates template with planned exercises and sets count', () => {
      const template = WorkoutTemplate.create({
        id: 'tpl-push-day',
        name: 'Push Day',
        items: [
          { exerciseId: 'ex-bench-press', plannedSets: 4 },
          { exerciseId: 'ex-overhead-press', plannedSets: 3 },
        ],
      });

      expect(template.name).toBe('Push Day');
      expect(template.items.length).toBe(2);
      expect(template.hasExercise('ex-bench-press')).toBe(true);
      expect(template.hasExercise('ex-squat')).toBe(false);
    });
  });

  describe('WorkoutSession', () => {
    it('starts as ACTIVE and allows logging sets', () => {
      const session = WorkoutSession.create({
        id: 'sess-123',
        templateId: 'tpl-push-day',
        startedAt: new Date('2026-10-15T10:00:00Z'),
      });

      expect(session.status).toBe(WorkoutSessionStatus.ACTIVE);

      const set1 = WorkoutSet.create({
        id: 's-1',
        exerciseId: 'ex-bench-press',
        setNumber: 1,
        weight: Weight.create(70),
        repetitions: Repetitions.create(10),
        warmup: Warmup.create(true),
        startedAt: new Date('2026-10-15T10:00:00Z'),
        completedAt: new Date('2026-10-15T10:00:30Z'),
      });

      session.addSet(set1);
      expect(session.sets.length).toBe(1);
      expect(session.getDistinctExerciseIds()).toContain('ex-bench-press');
    });

    it('calculates rest time automatically when second set is added', () => {
      const session = WorkoutSession.create({
        id: 'sess-123',
        startedAt: new Date('2026-10-15T10:00:00Z'),
      });

      const set1 = WorkoutSet.create({
        id: 's-1',
        exerciseId: 'ex-bench-press',
        setNumber: 1,
        weight: Weight.create(80),
        repetitions: Repetitions.create(10),
        warmup: Warmup.create(false),
        startedAt: new Date('2026-10-15T10:00:00Z'),
        completedAt: new Date('2026-10-15T10:00:40Z'),
      });

      const set2 = WorkoutSet.create({
        id: 's-2',
        exerciseId: 'ex-bench-press',
        setNumber: 2,
        weight: Weight.create(80),
        repetitions: Repetitions.create(8),
        warmup: Warmup.create(false),
        startedAt: new Date('2026-10-15T10:02:10Z'), // 90 seconds after set 1 completed
        completedAt: new Date('2026-10-15T10:02:50Z'),
      });

      session.addSet(set1);
      session.addSet(set2);

      expect(set2.restTimeBeforeThisSet?.seconds).toBe(90);
    });

    it('completes session and prevents editing sets after completion', () => {
      const session = WorkoutSession.create({
        id: 'sess-123',
        startedAt: new Date('2026-10-15T10:00:00Z'),
      });

      const set1 = WorkoutSet.create({
        id: 's-1',
        exerciseId: 'ex-bench-press',
        setNumber: 1,
        weight: Weight.create(80),
        repetitions: Repetitions.create(10),
        warmup: Warmup.create(false),
        startedAt: new Date('2026-10-15T10:00:00Z'),
        completedAt: new Date('2026-10-15T10:00:40Z'),
      });
      session.addSet(set1);

      session.complete(new Date('2026-10-15T10:30:00Z'));
      expect(session.status).toBe(WorkoutSessionStatus.COMPLETED);

      // Attempting to edit a set on completed session throws error
      expect(() => {
        session.updateSet('s-1', { weight: Weight.create(90) });
      }).toThrow('Cannot edit sets on a completed or cancelled session');
    });
  });
});
