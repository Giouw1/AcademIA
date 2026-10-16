import { NextResponse } from 'next/server';
import { z } from 'zod';
import { services } from '@/infrastructure/container';
import { CreateWorkoutTemplate } from '@/use_cases/templates/CreateWorkoutTemplate';
import { ListWorkoutTemplates } from '@/use_cases/templates/ListWorkoutTemplates';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  items: z.array(
    z.object({
      exerciseId: z.string().min(1),
      plannedSets: z.number().int().positive(),
    })
  ).min(1, 'At least one exercise is required'),
});

export async function GET() {
  try {
    const useCase = new ListWorkoutTemplates(services.templateRepo);
    const templates = await useCase.execute();
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const useCase = new CreateWorkoutTemplate(services.templateRepo);
    const created = await useCase.execute(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
