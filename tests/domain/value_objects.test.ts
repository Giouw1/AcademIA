import { describe, it, expect } from 'vitest';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { RestTime } from '@/domain/value_objects/RestTime';
import { Warmup } from '@/domain/value_objects/Warmup';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import { MuscleImpact } from '@/domain/value_objects/MuscleImpact';

describe('Domain Value Objects', () => {
  describe('Weight', () => {
    it('creates valid weight in kg', () => {
      const w = Weight.create(80);
      expect(w.value).toBe(80);
      expect(w.unit).toBe('kg');
    });

    it('throws error for negative weight', () => {
      expect(() => Weight.create(-5)).toThrow('Weight cannot be negative');
    });
  });

  describe('Repetitions', () => {
    it('creates valid repetitions', () => {
      const reps = Repetitions.create(10);
      expect(reps.value).toBe(10);
    });

    it('throws error for non-positive repetitions', () => {
      expect(() => Repetitions.create(0)).toThrow('Repetitions must be greater than zero');
      expect(() => Repetitions.create(-2)).toThrow('Repetitions must be greater than zero');
    });
  });

  describe('RestTime', () => {
    it('calculates rest time in seconds between two timestamps', () => {
      const previousSetEnd = new Date('2026-10-15T10:00:00Z');
      const nextSetStart = new Date('2026-10-15T10:01:30Z');
      const rest = RestTime.fromTimestamps(previousSetEnd, nextSetStart);
      expect(rest.seconds).toBe(90);
    });

    it('handles zero or negative duration by defaulting to 0', () => {
      const d1 = new Date('2026-10-15T10:01:00Z');
      const d2 = new Date('2026-10-15T10:00:00Z');
      const rest = RestTime.fromTimestamps(d1, d2);
      expect(rest.seconds).toBe(0);
    });
  });

  describe('Warmup', () => {
    it('creates warmup flag correctly', () => {
      expect(Warmup.create(true).isWarmup).toBe(true);
      expect(Warmup.create(false).isWarmup).toBe(false);
    });
  });

  describe('MuscleImpact', () => {
    it('calculates volume stress correctly: Sets * Reps * Weight * Multiplier', () => {
      const impact = MuscleImpact.calculate({
        sets: 3,
        reps: 10,
        weightKg: 80,
        multiplier: 1.0,
      });
      // 3 * 10 * 80 * 1.0 = 2400
      expect(impact.volume).toBe(2400);
    });

    it('returns 0 impact if warmup set', () => {
      const impact = MuscleImpact.calculate({
        sets: 3,
        reps: 10,
        weightKg: 80,
        multiplier: 1.0,
        isWarmup: true,
      });
      expect(impact.volume).toBe(0);
    });
  });
});
