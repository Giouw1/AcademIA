import { IExerciseRepository } from '@/domain/repositories/IExerciseRepository';
import { Exercise } from '@/domain/entities/Exercise';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';
import Database from 'better-sqlite3';

export class SQLiteExerciseRepository implements IExerciseRepository {
  constructor(private db: Database.Database) {}

  public async findById(id: string): Promise<Exercise | null> {
    const row = this.db.prepare('SELECT * FROM exercises WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapToEntity(row);
  }

  public async findAll(): Promise<Exercise[]> {
    const rows = this.db.prepare('SELECT * FROM exercises ORDER BY name ASC').all() as any[];
    return rows.map((r) => this.mapToEntity(r));
  }

  public async save(exercise: Exercise): Promise<void> {
    const multipliersObj: Record<string, number> = {};
    for (const [group, mult] of exercise.muscleMultipliers.entries()) {
      multipliersObj[group] = mult;
    }

    const stmt = this.db.prepare(`
      INSERT INTO exercises (id, name, image_path, multipliers_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        image_path = excluded.image_path,
        multipliers_json = excluded.multipliers_json
    `);

    stmt.run(exercise.id, exercise.name, exercise.imagePath ?? null, JSON.stringify(multipliersObj));
  }

  public async saveAll(exercises: Exercise[]): Promise<void> {
    const tx = this.db.transaction((items: Exercise[]) => {
      for (const ex of items) {
        this.saveSync(ex);
      }
    });
    tx(exercises);
  }

  private saveSync(exercise: Exercise): void {
    const multipliersObj: Record<string, number> = {};
    for (const [group, mult] of exercise.muscleMultipliers.entries()) {
      multipliersObj[group] = mult;
    }

    this.db.prepare(`
      INSERT INTO exercises (id, name, image_path, multipliers_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        image_path = excluded.image_path,
        multipliers_json = excluded.multipliers_json
    `).run(exercise.id, exercise.name, exercise.imagePath ?? null, JSON.stringify(multipliersObj));
  }

  private mapToEntity(row: any): Exercise {
    const rawMultipliers = JSON.parse(row.multipliers_json || '{}');
    const multipliers = new Map<MuscleGroup, number>();
    for (const [k, v] of Object.entries(rawMultipliers)) {
      multipliers.set(k as MuscleGroup, v as number);
    }

    return Exercise.create({
      id: row.id,
      name: row.name,
      imagePath: row.image_path || undefined,
      muscleMultipliers: multipliers,
    });
  }
}
