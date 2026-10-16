import { IWorkoutTemplateRepository } from '@/domain/repositories/IWorkoutTemplateRepository';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';

export class ListWorkoutTemplates {
  constructor(private templateRepo: IWorkoutTemplateRepository) {}

  public async execute(): Promise<WorkoutTemplate[]> {
    return this.templateRepo.findAll();
  }
}
