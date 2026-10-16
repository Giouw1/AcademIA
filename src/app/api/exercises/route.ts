import { NextResponse } from 'next/server';
import { services } from '@/infrastructure/container';

export async function GET() {
  try {
    const exercises = await services.exerciseRepo.findAll();
    return NextResponse.json(
      exercises.map((e) => ({
        id: e.id,
        name: e.name,
        imagePath: e.imagePath,
        muscleMultipliers: Object.fromEntries(e.muscleMultipliers),
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
