export interface MuscleImpactCalculationParams {
  sets: number;
  reps: number;
  weightKg: number;
  multiplier: number;
  isWarmup?: boolean;
}

export class MuscleImpact {
  private constructor(public readonly volume: number) {}

  public static calculate(params: MuscleImpactCalculationParams): MuscleImpact {
    if (params.isWarmup) {
      return new MuscleImpact(0);
    }
    // Impact (Volume) = Sets × Repetitions × Weight × Exercise_Muscle_Multiplier
    const volume = params.sets * params.reps * params.weightKg * params.multiplier;
    return new MuscleImpact(Math.max(0, volume));
  }
}
