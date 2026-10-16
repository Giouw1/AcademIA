import { IPermanentWorkoutRepository } from '@/domain/repositories/IPermanentWorkoutRepository';
import { WorkoutSession, WorkoutSessionStatus } from '@/domain/entities/WorkoutSession';
import { WorkoutSet } from '@/domain/entities/WorkoutSet';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';
import { RestTime } from '@/domain/value_objects/RestTime';
import Database from 'better-sqlite3';

export class SQLitePermanentWorkoutRepository implements IPermanentWorkoutRepository {
  constructor(private db: Database.Database) {}

  public async saveCompletedSession(session: WorkoutSession): Promise<void> {
    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          INSERT INTO completed_sessions (id, template_id, status, started_at, completed_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            template_id = excluded.template_id,
            status = excluded.status,
            completed_at = excluded.completed_at
        `)
        .run(
          session.id,
          session.templateId ?? null,
          session.status,
          session.startedAt.toISOString(),
          session.completedAt?.toISOString() ?? new Date().toISOString()
        );

      this.db.prepare('DELETE FROM completed_sets WHERE session_id = ?').run(session.id);

      const insertSet = this.db.prepare(`
        INSERT INTO completed_sets (
          id, session_id, exercise_id, set_number, weight, weight_unit,
          repetitions, is_warmup, started_at, completed_at, rest_time_seconds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const set of session.sets) {
        insertSet.run(
          set.id,
          session.id,
          set.exerciseId,
          set.setNumber,
          set.weight.value,
          set.weight.unit,
          set.repetitions.value,
          set.warmup.isWarmup ? 1 : 0,
          set.startedAt.toISOString(),
          set.completedAt.toISOString(),
          set.restTimeBeforeThisSet?.seconds ?? null
        );
      }
    });

    tx();
  }

  public async findById(sessionId: string): Promise<WorkoutSession | null> {
    const sessionRow = this.db
      .prepare('SELECT * FROM completed_sessions WHERE id = ?')
      .get(sessionId) as any;

    if (!sessionRow) return null;

    const setRows = this.db
      .prepare('SELECT * FROM completed_sets WHERE session_id = ? ORDER BY set_number ASC')
      .all(sessionId) as any[];

    return this.mapToEntity(sessionRow, setRows);
  }

  public async findAll(): Promise<WorkoutSession[]> {
    const sessionRows = this.db
      .prepare('SELECT * FROM completed_sessions ORDER BY completed_at DESC')
      .all() as any[];

    return sessionRows.map((sRow) => {
      const setRows = this.db
        .prepare('SELECT * FROM completed_sets WHERE session_id = ? ORDER BY set_number ASC')
        .all(sRow.id) as any[];
      return this.mapToEntity(sRow, setRows);
    });
  }

  public async findByDateRange(startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    const sessionRows = this.db
      .prepare(
        'SELECT * FROM completed_sessions WHERE completed_at >= ? AND completed_at <= ? ORDER BY completed_at ASC'
      )
      .all(startDate.toISOString(), endDate.toISOString()) as any[];

    return sessionRows.map((sRow) => {
      const setRows = this.db
        .prepare('SELECT * FROM completed_sets WHERE session_id = ? ORDER BY set_number ASC')
        .all(sRow.id) as any[];
      return this.mapToEntity(sRow, setRows);
    });
  }

  private mapToEntity(sessionRow: any, setRows: any[]): WorkoutSession {
    const sets = setRows.map((r) =>
      WorkoutSet.create({
        id: r.id,
        exerciseId: r.exercise_id,
        setNumber: r.set_number,
        weight: Weight.create(r.weight, r.weight_unit),
        repetitions: Repetitions.create(r.repetitions),
        warmup: Warmup.create(r.is_warmup === 1),
        startedAt: new Date(r.started_at),
        completedAt: new Date(r.completed_at),
        restTimeBeforeThisSet:
          r.rest_time_seconds !== null ? RestTime.create(r.rest_time_seconds) : undefined,
      })
    );

    return WorkoutSession.create({
      id: sessionRow.id,
      templateId: sessionRow.template_id || undefined,
      status: sessionRow.status as WorkoutSessionStatus,
      startedAt: new Date(sessionRow.started_at),
      completedAt: sessionRow.completed_at ? new Date(sessionRow.completed_at) : undefined,
      sets,
    });
  }
}
