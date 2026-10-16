import { SQLiteConnectionFactory } from './database/sqlite_client';
import { SQLiteExerciseRepository } from './repositories/SQLiteExerciseRepository';
import { SQLiteWorkoutTemplateRepository } from './repositories/SQLiteWorkoutTemplateRepository';
import { SQLiteStagingSessionRepository } from './repositories/SQLiteStagingSessionRepository';
import { SQLitePermanentWorkoutRepository } from './repositories/SQLitePermanentWorkoutRepository';
import { INITIAL_EXERCISES } from './database/seed_data';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';

class ServiceContainer {
  private static instance: ServiceContainer;

  public exerciseRepo: SQLiteExerciseRepository;
  public templateRepo: SQLiteWorkoutTemplateRepository;
  public stagingSessionRepo: SQLiteStagingSessionRepository;
  public permanentWorkoutRepo: SQLitePermanentWorkoutRepository;

  private constructor() {
    const stagingDb = SQLiteConnectionFactory.getStagingDb();
    const permanentDb = SQLiteConnectionFactory.getPermanentDb();

    this.exerciseRepo = new SQLiteExerciseRepository(permanentDb);
    this.templateRepo = new SQLiteWorkoutTemplateRepository(permanentDb);
    this.stagingSessionRepo = new SQLiteStagingSessionRepository(stagingDb);
    this.permanentWorkoutRepo = new SQLitePermanentWorkoutRepository(permanentDb);

    this.seedIfEmpty();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private seedIfEmpty(): void {
    try {
      const existing = this.exerciseRepo.findAll();
      existing.then(async (exercises) => {
        if (exercises.length === 0) {
          await this.exerciseRepo.saveAll(INITIAL_EXERCISES);

          // Seed default push template
          await this.templateRepo.save(
            WorkoutTemplate.create({
              id: 'push-workout',
              name: 'Push Workout (Chest & Shoulders)',
              items: [
                { exerciseId: 'bench-press', plannedSets: 4 },
                { exerciseId: 'incline-dumbbell-press', plannedSets: 3 },
                { exerciseId: 'overhead-press', plannedSets: 3 },
                { exerciseId: 'tricep-pushdown', plannedSets: 3 },
              ],
            })
          );

          // Seed default leg template
          await this.templateRepo.save(
            WorkoutTemplate.create({
              id: 'leg-workout',
              name: 'Leg Day (Quads & Hamstrings)',
              items: [
                { exerciseId: 'barbell-squat', plannedSets: 4 },
                { exerciseId: 'romanian-deadlift', plannedSets: 4 },
                { exerciseId: 'standing-calf-raise', plannedSets: 4 },
              ],
            })
          );
        }
      });
    } catch (e) {
      // In dev or test environments, ignore duplicate seeding
    }
  }
}

export const services = ServiceContainer.getInstance();
