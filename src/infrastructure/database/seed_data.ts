import { Exercise } from '@/domain/entities/Exercise';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';

export const INITIAL_EXERCISES: Exercise[] = [
  Exercise.create({
    id: 'bench-press',
    name: 'Barbell Bench Press',
    imagePath: '/exercises/bench_press.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.CHEST, 1.0],
      [MuscleGroup.TRICEPS, 0.4],
      [MuscleGroup.SHOULDERS, 0.3],
    ]),
  }),
  Exercise.create({
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    imagePath: '/exercises/incline_press.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.CHEST, 0.85],
      [MuscleGroup.SHOULDERS, 0.5],
      [MuscleGroup.TRICEPS, 0.3],
    ]),
  }),
  Exercise.create({
    id: 'barbell-squat',
    name: 'Barbell Squat',
    imagePath: '/exercises/squat.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.QUADRICEPS, 1.0],
      [MuscleGroup.GLUTES, 0.7],
      [MuscleGroup.CORE, 0.3],
    ]),
  }),
  Exercise.create({
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    imagePath: '/exercises/rdl.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.HAMSTRINGS, 1.0],
      [MuscleGroup.GLUTES, 0.8],
      [MuscleGroup.BACK, 0.4],
    ]),
  }),
  Exercise.create({
    id: 'pull-up',
    name: 'Pull Up / Lat Pulldown',
    imagePath: '/exercises/pullup.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.BACK, 1.0],
      [MuscleGroup.BICEPS, 0.5],
      [MuscleGroup.CORE, 0.2],
    ]),
  }),
  Exercise.create({
    id: 'barbell-row',
    name: 'Barbell Bent Over Row',
    imagePath: '/exercises/row.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.BACK, 0.9],
      [MuscleGroup.BICEPS, 0.4],
      [MuscleGroup.SHOULDERS, 0.3],
    ]),
  }),
  Exercise.create({
    id: 'overhead-press',
    name: 'Standing Overhead Press',
    imagePath: '/exercises/ohp.svg',
    muscleMultipliers: new Map([
      [MuscleGroup.SHOULDERS, 1.0],
      [MuscleGroup.TRICEPS, 0.5],
      [MuscleGroup.CORE, 0.3],
    ]),
  }),
  Exercise.create({
    id: 'barbell-curl',
    name: 'Barbell Bicep Curl',
    imagePath: '/exercises/bicep_curl.svg',
    muscleMultipliers: new Map([[MuscleGroup.BICEPS, 1.0]]),
  }),
  Exercise.create({
    id: 'tricep-pushdown',
    name: 'Tricep Rope Pushdown',
    imagePath: '/exercises/tricep_pushdown.svg',
    muscleMultipliers: new Map([[MuscleGroup.TRICEPS, 1.0]]),
  }),
  Exercise.create({
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    imagePath: '/exercises/calf_raise.svg',
    muscleMultipliers: new Map([[MuscleGroup.CALVES, 1.0]]),
  }),
];
