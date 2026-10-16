import { WorkoutSession } from '../entities/WorkoutSession';

export interface IPermanentWorkoutRepository {
  saveCompletedSession(session: WorkoutSession): Promise<void>;
  findById(sessionId: string): Promise<WorkoutSession | null>;
  findAll(): Promise<WorkoutSession[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<WorkoutSession[]>;
}
