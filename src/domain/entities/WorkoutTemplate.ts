export interface TemplateItem {
  exerciseId: string;
  plannedSets: number;
}

export interface WorkoutTemplateProps {
  id: string;
  name: string;
  items: TemplateItem[];
}

export class WorkoutTemplate {
  public readonly id: string;
  public readonly name: string;
  public readonly items: TemplateItem[];

  private constructor(props: WorkoutTemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.items = props.items;
  }

  public static create(props: WorkoutTemplateProps): WorkoutTemplate {
    if (!props.name || props.name.trim() === '') {
      throw new Error('Template name cannot be empty');
    }
    return new WorkoutTemplate(props);
  }

  public hasExercise(exerciseId: string): boolean {
    return this.items.some((item) => item.exerciseId === exerciseId);
  }
}
