import { Exercise } from '../entities/Exercise';

export interface IExerciseRepository {
  findById(id: string): Promise<Exercise | null>;
  findAll(): Promise<Exercise[]>;
  save(exercise: Exercise): Promise<void>;
  saveAll(exercises: Exercise[]): Promise<void>;
}
