import { IPermanentWorkoutRepository } from '@/domain/repositories/IPermanentWorkoutRepository';
import { IExerciseRepository } from '@/domain/repositories/IExerciseRepository';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import { MuscleImpact } from '@/domain/value_objects/MuscleImpact';

export interface CalculateMuscleImpactDTO {
  startDate: Date;
  endDate: Date;
}

export class CalculateMuscleImpact {
  constructor(
    private permanentRepo: IPermanentWorkoutRepository,
    private exerciseRepo: IExerciseRepository
  ) {}

  public async execute(dto: CalculateMuscleImpactDTO): Promise<Map<MuscleGroup, number>> {
    const sessions = await this.permanentRepo.findByDateRange(dto.startDate, dto.endDate);
    const exercises = await this.exerciseRepo.findAll();
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    const totals = new Map<MuscleGroup, number>();
    for (const group of Object.values(MuscleGroup)) {
      totals.set(group, 0);
    }

    for (const session of sessions) {
      for (const set of session.sets) {
        // Warmup sets must not be counted for statistics
        if (set.warmup.isWarmup) {
          continue;
        }

        const exercise = exerciseMap.get(set.exerciseId);
        if (!exercise) continue;

        for (const [group, multiplier] of exercise.muscleMultipliers.entries()) {
          const impact = MuscleImpact.calculate({
            sets: 1,
            reps: set.repetitions.value,
            weightKg: set.weight.value,
            multiplier,
            isWarmup: false,
          });

          const current = totals.get(group) ?? 0;
          totals.set(group, current + impact.volume);
        }
      }
    }

    return totals;
  }
}
