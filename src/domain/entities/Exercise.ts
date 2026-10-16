import { MuscleGroup } from '../value_objects/MuscleGroup';

export interface ExerciseProps {
  id: string;
  name: string;
  muscleMultipliers: Map<MuscleGroup, number>;
  imagePath?: string;
}

export class Exercise {
  public readonly id: string;
  public readonly name: string;
  public readonly muscleMultipliers: Map<MuscleGroup, number>;
  public readonly imagePath?: string;

  private constructor(props: ExerciseProps) {
    this.id = props.id;
    this.name = props.name;
    this.muscleMultipliers = props.muscleMultipliers;
    this.imagePath = props.imagePath;
  }

  public static create(props: ExerciseProps): Exercise {
    if (!props.name || props.name.trim() === '') {
      throw new Error('Exercise name cannot be empty');
    }
    return new Exercise(props);
  }

  public getMultiplierFor(group: MuscleGroup): number {
    return this.muscleMultipliers.get(group) ?? 0;
  }
}
