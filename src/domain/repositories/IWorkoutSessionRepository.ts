import { WorkoutSession } from '../entities/WorkoutSession';

export interface IWorkoutSessionRepository {
  findActiveById(sessionId: string): Promise<WorkoutSession | null>;
  findActive(): Promise<WorkoutSession | null>;
  saveDraft(session: WorkoutSession): Promise<void>;
  deleteDraft(sessionId: string): Promise<void>;
  cleanupExpiredDrafts(ttlMinutes: number): Promise<number>;
}
