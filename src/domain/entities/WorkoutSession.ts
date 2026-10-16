import { WorkoutSet } from './WorkoutSet';
import { RestTime } from '../value_objects/RestTime';
import { Weight } from '../value_objects/Weight';
import { Repetitions } from '../value_objects/Repetitions';
import { Warmup } from '../value_objects/Warmup';

export enum WorkoutSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface WorkoutSessionProps {
  id: string;
  templateId?: string;
  status?: WorkoutSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  sets?: WorkoutSet[];
}

export class WorkoutSession {
  public readonly id: string;
  public templateId?: string;
  public status: WorkoutSessionStatus;
  public readonly startedAt: Date;
  public completedAt?: Date;
  private _sets: WorkoutSet[];

  private constructor(props: WorkoutSessionProps) {
    this.id = props.id;
    this.templateId = props.templateId;
    this.status = props.status ?? WorkoutSessionStatus.ACTIVE;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this._sets = props.sets ? [...props.sets] : [];
  }

  public static create(props: WorkoutSessionProps): WorkoutSession {
    return new WorkoutSession(props);
  }

  public get sets(): ReadonlyArray<WorkoutSet> {
    return this._sets;
  }

  public addSet(set: WorkoutSet): void {
    if (this.status !== WorkoutSessionStatus.ACTIVE) {
      throw new Error('Cannot add sets to an inactive session');
    }

    if (this._sets.length > 0) {
      const lastSet = this._sets[this._sets.length - 1];
      const rest = RestTime.fromTimestamps(lastSet.completedAt, set.startedAt);
      set.setRestTimeBeforeThisSet(rest);
    }

    this._sets.push(set);
  }

  public updateSet(
    setId: string,
    updates: { weight?: Weight; repetitions?: Repetitions; warmup?: Warmup }
  ): void {
    if (this.status !== WorkoutSessionStatus.ACTIVE) {
      throw new Error('Cannot edit sets on a completed or cancelled session');
    }

    const set = this._sets.find((s) => s.id === setId);
    if (!set) {
      throw new Error(`Set with id ${setId} not found in session`);
    }

    if (updates.weight) set.updateWeight(updates.weight);
    if (updates.repetitions) set.updateRepetitions(updates.repetitions);
    if (updates.warmup) set.updateWarmup(updates.warmup);
  }

  public setTemplateId(templateId: string): void {
    this.templateId = templateId;
  }

  public complete(completedAt: Date = new Date()): void {
    if (this.status !== WorkoutSessionStatus.ACTIVE) {
      throw new Error('Session is already finalized');
    }
    this.status = WorkoutSessionStatus.COMPLETED;
    this.completedAt = completedAt;
  }

  public cancel(): void {
    if (this.status !== WorkoutSessionStatus.ACTIVE) {
      throw new Error('Session is already finalized');
    }
    this.status = WorkoutSessionStatus.CANCELLED;
  }

  public getDistinctExerciseIds(): string[] {
    return Array.from(new Set(this._sets.map((s) => s.exerciseId)));
  }
}
