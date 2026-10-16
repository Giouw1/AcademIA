import { IPermanentWorkoutRepository } from '@/domain/repositories/IPermanentWorkoutRepository';

export interface ExerciseProgressRecord {
  date: string;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  totalVolume: number;
  totalSets: number;
  averageRestTimeSeconds: number;
}

export class GetExerciseProgress {
  constructor(private permanentRepo: IPermanentWorkoutRepository) {}

  public async execute(exerciseId: string): Promise<ExerciseProgressRecord[]> {
    const sessions = await this.permanentRepo.findAll();
    const records: ExerciseProgressRecord[] = [];

    for (const session of sessions) {
      const sets = session.sets.filter((s) => s.exerciseId === exerciseId && !s.warmup.isWarmup);
      if (sets.length === 0) continue;

      let maxWeight = 0;
      let maxReps = 0;
      let totalVolume = 0;
      let totalRestSeconds = 0;
      let restCount = 0;

      for (const set of sets) {
        if (set.weight.value > maxWeight) {
          maxWeight = set.weight.value;
          maxReps = set.repetitions.value;
        } else if (set.weight.value === maxWeight && set.repetitions.value > maxReps) {
          maxReps = set.repetitions.value;
        }

        totalVolume += set.weight.value * set.repetitions.value;
        if (set.restTimeBeforeThisSet) {
          totalRestSeconds += set.restTimeBeforeThisSet.seconds;
          restCount++;
        }
      }

      records.push({
        date: session.completedAt ? session.completedAt.toISOString() : session.startedAt.toISOString(),
        maxWeight,
        maxRepsAtMaxWeight: maxReps,
        totalVolume,
        totalSets: sets.length,
        averageRestTimeSeconds: restCount > 0 ? Math.round(totalRestSeconds / restCount) : 0,
      });
    }

    return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
