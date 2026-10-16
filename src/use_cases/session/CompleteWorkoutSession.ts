import { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import { IPermanentWorkoutRepository } from '@/domain/repositories/IPermanentWorkoutRepository';
import { IWorkoutTemplateRepository } from '@/domain/repositories/IWorkoutTemplateRepository';
import { WorkoutSession } from '@/domain/entities/WorkoutSession';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';
import { randomUUID } from 'crypto';

export interface CompleteWorkoutSessionDTO {
  sessionId: string;
  completedAt?: Date;
}

export class CompleteWorkoutSession {
  constructor(
    private sessionRepo: IWorkoutSessionRepository,
    private permanentRepo: IPermanentWorkoutRepository,
    private templateRepo: IWorkoutTemplateRepository
  ) {}

  public async execute(dto: CompleteWorkoutSessionDTO): Promise<WorkoutSession> {
    const session = await this.sessionRepo.findActiveById(dto.sessionId);
    if (!session) {
      throw new Error(`Active session with id ${dto.sessionId} not found`);
    }

    const executedExerciseIds = session.getDistinctExerciseIds();

    // Check if session exercises match an existing template
    let matchedTemplate = await this.templateRepo.findByExerciseIds(executedExerciseIds);

    if (!matchedTemplate && executedExerciseIds.length > 0) {
      // Edge Case: Changing plans / new routine -> Create new template automatically
      const newTemplateId = randomUUID();
      const items = executedExerciseIds.map((exId) => {
        const count = session.sets.filter((s) => s.exerciseId === exId).length;
        return {
          exerciseId: exId,
          plannedSets: count,
        };
      });

      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      matchedTemplate = WorkoutTemplate.create({
        id: newTemplateId,
        name: `Custom Routine (${dateStr})`,
        items,
      });

      await this.templateRepo.save(matchedTemplate);
    }

    if (matchedTemplate) {
      session.setTemplateId(matchedTemplate.id);
    }

    // Complete session
    session.complete(dto.completedAt ?? new Date());

    // Flush to permanent storage
    await this.permanentRepo.saveCompletedSession(session);

    // Evict from staging
    await this.sessionRepo.deleteDraft(session.id);

    return session;
  }
}
