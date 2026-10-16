import { NextResponse } from 'next/server';
import { z } from 'zod';
import { services } from '@/infrastructure/container';
import { EditActiveSet } from '@/use_cases/session/EditActiveSet';

const editSetSchema = z.object({
  weight: z.number().min(0).optional(),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  reps: z.number().int().positive().optional(),
  isWarmup: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; setId: string }> }
) {
  try {
    const { id: sessionId, setId } = await context.params;
    const body = await request.json();
    const parsed = editSetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const useCase = new EditActiveSet(services.stagingSessionRepo);
    const session = await useCase.execute({
      sessionId,
      setId,
      weight: parsed.data.weight,
      weightUnit: parsed.data.weightUnit,
      reps: parsed.data.reps,
      isWarmup: parsed.data.isWarmup,
    });

    const editedSet = session.sets.find((s) => s.id === setId);

    return NextResponse.json({
      success: true,
      set: editedSet
        ? {
            id: editedSet.id,
            exerciseId: editedSet.exerciseId,
            setNumber: editedSet.setNumber,
            weight: editedSet.weight.value,
            reps: editedSet.repetitions.value,
            isWarmup: editedSet.warmup.isWarmup,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
