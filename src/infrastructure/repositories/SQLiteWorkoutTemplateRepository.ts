import { IWorkoutTemplateRepository } from '@/domain/repositories/IWorkoutTemplateRepository';
import { WorkoutTemplate } from '@/domain/entities/WorkoutTemplate';
import Database from 'better-sqlite3';

export class SQLiteWorkoutTemplateRepository implements IWorkoutTemplateRepository {
  constructor(private db: Database.Database) {}

  public async findById(id: string): Promise<WorkoutTemplate | null> {
    const row = this.db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapToEntity(row);
  }

  public async findByName(name: string): Promise<WorkoutTemplate | null> {
    const row = this.db.prepare('SELECT * FROM workout_templates WHERE name = ?').get(name) as any;
    if (!row) return null;
    return this.mapToEntity(row);
  }

  public async findByExerciseIds(exerciseIds: string[]): Promise<WorkoutTemplate | null> {
    const all = await this.findAll();
    const sortedTarget = [...exerciseIds].sort();

    for (const tpl of all) {
      const tplExerciseIds = tpl.items.map((i) => i.exerciseId).sort();
      if (
        sortedTarget.length === tplExerciseIds.length &&
        sortedTarget.every((val, index) => val === tplExerciseIds[index])
      ) {
        return tpl;
      }
    }

    return null;
  }

  public async findAll(): Promise<WorkoutTemplate[]> {
    const rows = this.db.prepare('SELECT * FROM workout_templates ORDER BY name ASC').all() as any[];
    return rows.map((r) => this.mapToEntity(r));
  }

  public async save(template: WorkoutTemplate): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO workout_templates (id, name, items_json)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        items_json = excluded.items_json
    `);

    stmt.run(template.id, template.name, JSON.stringify(template.items));
  }

  private mapToEntity(row: any): WorkoutTemplate {
    const items = JSON.parse(row.items_json || '[]');
    return WorkoutTemplate.create({
      id: row.id,
      name: row.name,
      items,
    });
  }
}
