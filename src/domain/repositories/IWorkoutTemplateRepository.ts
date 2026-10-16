import { WorkoutTemplate } from '../entities/WorkoutTemplate';

export interface IWorkoutTemplateRepository {
  findById(id: string): Promise<WorkoutTemplate | null>;
  findByName(name: string): Promise<WorkoutTemplate | null>;
  findByExerciseIds(exerciseIds: string[]): Promise<WorkoutTemplate | null>;
  findAll(): Promise<WorkoutTemplate[]>;
  save(template: WorkoutTemplate): Promise<void>;
}
