import { NextResponse } from 'next/server';
import { services } from '@/infrastructure/container';
import { CalculateMuscleImpact } from '@/use_cases/metrics/CalculateMuscleImpact';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    // Default to last 30 days if not supplied
    const startDate = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = toStr ? new Date(toStr) : new Date();

    const useCase = new CalculateMuscleImpact(
      services.permanentWorkoutRepo,
      services.exerciseRepo
    );

    const impactMap = await useCase.execute({ startDate, endDate });

    return NextResponse.json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      impact: Object.fromEntries(impactMap),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
