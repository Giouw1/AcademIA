import { NextResponse } from 'next/server';
import { services } from '@/infrastructure/container';
import { GetExerciseProgress } from '@/use_cases/metrics/GetExerciseProgress';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId query parameter is required' }, { status: 400 });
    }

    const useCase = new GetExerciseProgress(services.permanentWorkoutRepo);
    const progress = await useCase.execute(exerciseId);

    return NextResponse.json({ exerciseId, progress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
