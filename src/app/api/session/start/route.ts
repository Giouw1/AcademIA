import { NextResponse } from 'next/server';
import { z } from 'zod';
import { services } from '@/infrastructure/container';
import { StartWorkoutSession } from '@/use_cases/session/StartWorkoutSession';

const startSessionSchema = z.object({
  templateId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let templateId: string | undefined;
    try {
      const body = await request.json();
      const parsed = startSessionSchema.safeParse(body);
      if (parsed.success) {
        templateId = parsed.data.templateId;
      }
    } catch {
      // Body may be empty if starting freeform workout
    }

    const useCase = new StartWorkoutSession(services.stagingSessionRepo);
    const session = await useCase.execute({ templateId });

    return NextResponse.json({
      id: session.id,
      templateId: session.templateId,
      status: session.status,
      startedAt: session.startedAt,
      sets: session.sets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
