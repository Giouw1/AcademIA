import { IWorkoutTemplateRepository } from '@/domain/repositories/IWorkoutTemplateRepository';
import { WorkoutTemplate, TemplateItem } from '@/domain/entities/WorkoutTemplate';
import { randomUUID } from 'crypto';

export interface CreateWorkoutTemplateDTO {
  name: string;
  items: TemplateItem[];
}

export class CreateWorkoutTemplate {
  constructor(private templateRepo: IWorkoutTemplateRepository) {}

  public async execute(dto: CreateWorkoutTemplateDTO): Promise<WorkoutTemplate> {
    const template = WorkoutTemplate.create({
      id: randomUUID(),
      name: dto.name,
      items: dto.items,
    });

    await this.templateRepo.save(template);
    return template;
  }
}
