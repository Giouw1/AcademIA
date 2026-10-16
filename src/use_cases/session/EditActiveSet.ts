import { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import { WorkoutSession } from '@/domain/entities/WorkoutSession';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';

export interface EditActiveSetDTO {
  sessionId: string;
  setId: string;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  reps?: number;
  isWarmup?: boolean;
}

export class EditActiveSet {
  constructor(private sessionRepo: IWorkoutSessionRepository) {}

  public async execute(dto: EditActiveSetDTO): Promise<WorkoutSession> {
    const session = await this.sessionRepo.findActiveById(dto.sessionId);
    if (!session) {
      throw new Error(`Active session with id ${dto.sessionId} not found`);
    }

    session.updateSet(dto.setId, {
      weight: dto.weight !== undefined ? Weight.create(dto.weight, dto.weightUnit ?? 'kg') : undefined,
      repetitions: dto.reps !== undefined ? Repetitions.create(dto.reps) : undefined,
      warmup: dto.isWarmup !== undefined ? Warmup.create(dto.isWarmup) : undefined,
    });

    await this.sessionRepo.saveDraft(session);
    return session;
  }
}
