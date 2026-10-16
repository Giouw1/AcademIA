import { NextResponse } from 'next/server';
import { z } from 'zod';
import { services } from '@/infrastructure/container';
import { LogCompletedSet } from '@/use_cases/session/LogCompletedSet';

const logSetSchema = z.object({
  exerciseId: z.string().min(1, 'exerciseId is required'),
  weight: z.number().min(0, 'Weight must be non-negative'),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  reps: z.number().int().positive('Reps must be positive'),
  isWarmup: z.boolean().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params;
    const body = await request.json();
    const parsed = logSetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const useCase = new LogCompletedSet(services.stagingSessionRepo);
    const result = await useCase.execute({
      sessionId,
      exerciseId: parsed.data.exerciseId,
      weight: parsed.data.weight,
      weightUnit: parsed.data.weightUnit,
      reps: parsed.data.reps,
      isWarmup: parsed.data.isWarmup,
      startedAt: new Date(parsed.data.startedAt),
      completedAt: new Date(parsed.data.completedAt),
    });

    return NextResponse.json(
      {
        session: {
          id: result.session.id,
          status: result.session.status,
          setsCount: result.session.sets.length,
        },
        loggedSet: {
          id: result.loggedSet.id,
          exerciseId: result.loggedSet.exerciseId,
          setNumber: result.loggedSet.setNumber,
          weight: result.loggedSet.weight.value,
          reps: result.loggedSet.repetitions.value,
          isWarmup: result.loggedSet.warmup.isWarmup,
          restTimeBeforeThisSet: result.loggedSet.restTimeBeforeThisSet?.seconds,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
