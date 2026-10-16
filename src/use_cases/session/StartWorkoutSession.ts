import { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import { WorkoutSession } from '@/domain/entities/WorkoutSession';
import { randomUUID } from 'crypto';

export interface StartWorkoutSessionDTO {
  templateId?: string;
  startedAt?: Date;
}

export class StartWorkoutSession {
  constructor(private sessionRepo: IWorkoutSessionRepository) {}

  public async execute(dto: StartWorkoutSessionDTO = {}): Promise<WorkoutSession> {
    const existing = await this.sessionRepo.findActive();
    if (existing) {
      return existing;
    }

    const session = WorkoutSession.create({
      id: randomUUID(),
      templateId: dto.templateId,
      startedAt: dto.startedAt ?? new Date(),
    });

    await this.sessionRepo.saveDraft(session);
    return session;
  }
}
