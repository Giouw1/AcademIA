import { NextResponse } from 'next/server';
import { services } from '@/infrastructure/container';
import { CompleteWorkoutSession } from '@/use_cases/session/CompleteWorkoutSession';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params;
    const useCase = new CompleteWorkoutSession(
      services.stagingSessionRepo,
      services.permanentWorkoutRepo,
      services.templateRepo
    );

    const completed = await useCase.execute({ sessionId });

    return NextResponse.json({
      success: true,
      session: {
        id: completed.id,
        templateId: completed.templateId,
        status: completed.status,
        completedAt: completed.completedAt,
        setsCount: completed.sets.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
