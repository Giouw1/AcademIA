import { NextResponse } from 'next/server';
import { services } from '@/infrastructure/container';

export async function GET() {
  try {
    const session = await services.stagingSessionRepo.findActive();
    if (!session) {
      return NextResponse.json({ active: false, session: null });
    }

    return NextResponse.json({
      active: true,
      session: {
        id: session.id,
        templateId: session.templateId,
        status: session.status,
        startedAt: session.startedAt,
        sets: session.sets.map((s) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight.value,
          weightUnit: s.weight.unit,
          reps: s.repetitions.value,
          isWarmup: s.warmup.isWarmup,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          restTimeBeforeThisSet: s.restTimeBeforeThisSet?.seconds,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
