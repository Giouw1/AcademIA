import { Weight } from '../value_objects/Weight';
import { Repetitions } from '../value_objects/Repetitions';
import { RestTime } from '../value_objects/RestTime';
import { Warmup } from '../value_objects/Warmup';

export interface WorkoutSetProps {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: Weight;
  repetitions: Repetitions;
  warmup: Warmup;
  startedAt: Date;
  completedAt: Date;
  restTimeBeforeThisSet?: RestTime;
}

export class WorkoutSet {
  public readonly id: string;
  public readonly exerciseId: string;
  public readonly setNumber: number;
  public weight: Weight;
  public repetitions: Repetitions;
  public warmup: Warmup;
  public readonly startedAt: Date;
  public readonly completedAt: Date;
  public restTimeBeforeThisSet?: RestTime;

  private constructor(props: WorkoutSetProps) {
    this.id = props.id;
    this.exerciseId = props.exerciseId;
    this.setNumber = props.setNumber;
    this.weight = props.weight;
    this.repetitions = props.repetitions;
    this.warmup = props.warmup;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.restTimeBeforeThisSet = props.restTimeBeforeThisSet;
  }

  public static create(props: WorkoutSetProps): WorkoutSet {
    return new WorkoutSet(props);
  }

  public updateWeight(weight: Weight): void {
    this.weight = weight;
  }

  public updateRepetitions(repetitions: Repetitions): void {
    this.repetitions = repetitions;
  }

  public updateWarmup(warmup: Warmup): void {
    this.warmup = warmup;
  }

  public setRestTimeBeforeThisSet(restTime: RestTime): void {
    this.restTimeBeforeThisSet = restTime;
  }
}
