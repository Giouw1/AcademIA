import { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import { WorkoutSession } from '@/domain/entities/WorkoutSession';
import { WorkoutSet } from '@/domain/entities/WorkoutSet';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';
import { randomUUID } from 'crypto';

export interface LogCompletedSetDTO {
  sessionId: string;
  exerciseId: string;
  weight: number;
  weightUnit?: 'kg' | 'lbs';
  reps: number;
  isWarmup?: boolean;
  startedAt: Date;
  completedAt: Date;
}

export interface LogCompletedSetResult {
  session: WorkoutSession;
  loggedSet: WorkoutSet;
}

export class LogCompletedSet {
  constructor(private sessionRepo: IWorkoutSessionRepository) {}

  public async execute(dto: LogCompletedSetDTO): Promise<LogCompletedSetResult> {
    const session = await this.sessionRepo.findActiveById(dto.sessionId);
    if (!session) {
      throw new Error(`Active session with id ${dto.sessionId} not found`);
    }

    // Set number for this exercise
    const exerciseSets = session.sets.filter((s) => s.exerciseId === dto.exerciseId);
    const setNumber = exerciseSets.length + 1;

    const set = WorkoutSet.create({
      id: randomUUID(),
      exerciseId: dto.exerciseId,
      setNumber,
      weight: Weight.create(dto.weight, dto.weightUnit ?? 'kg'),
      repetitions: Repetitions.create(dto.reps),
      warmup: Warmup.create(Boolean(dto.isWarmup)),
      startedAt: dto.startedAt,
      completedAt: dto.completedAt,
    });

    session.addSet(set);
    await this.sessionRepo.saveDraft(session);

    return { session, loggedSet: set };
  }
}
