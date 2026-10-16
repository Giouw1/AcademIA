import { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import { WorkoutSession, WorkoutSessionStatus } from '@/domain/entities/WorkoutSession';
import { WorkoutSet } from '@/domain/entities/WorkoutSet';
import { Weight } from '@/domain/value_objects/Weight';
import { Repetitions } from '@/domain/value_objects/Repetitions';
import { Warmup } from '@/domain/value_objects/Warmup';
import { RestTime } from '@/domain/value_objects/RestTime';
import Database from 'better-sqlite3';

export class SQLiteStagingSessionRepository implements IWorkoutSessionRepository {
  private inMemoryCache: Map<string, WorkoutSession> = new Map();

  constructor(private db: Database.Database) {}

  public async findActiveById(sessionId: string): Promise<WorkoutSession | null> {
    if (this.inMemoryCache.has(sessionId)) {
      return this.inMemoryCache.get(sessionId)!;
    }

    const sessionRow = this.db
      .prepare('SELECT * FROM staging_sessions WHERE id = ? AND status = ?')
      .get(sessionId, WorkoutSessionStatus.ACTIVE) as any;

    if (!sessionRow) return null;

    const setRows = this.db
      .prepare('SELECT * FROM staging_sets WHERE session_id = ? ORDER BY set_number ASC')
      .all(sessionId) as any[];

    const session = this.mapToEntity(sessionRow, setRows);
    this.inMemoryCache.set(sessionId, session);
    return session;
  }

  public async findActive(): Promise<WorkoutSession | null> {
    for (const session of this.inMemoryCache.values()) {
      if (session.status === WorkoutSessionStatus.ACTIVE) {
        return session;
      }
    }

    const sessionRow = this.db
      .prepare('SELECT * FROM staging_sessions WHERE status = ? ORDER BY started_at DESC LIMIT 1')
      .get(WorkoutSessionStatus.ACTIVE) as any;

    if (!sessionRow) return null;

    const setRows = this.db
      .prepare('SELECT * FROM staging_sets WHERE session_id = ? ORDER BY set_number ASC')
      .all(sessionRow.id) as any[];

    const session = this.mapToEntity(sessionRow, setRows);
    this.inMemoryCache.set(session.id, session);
    return session;
  }

  public async saveDraft(session: WorkoutSession): Promise<void> {
    this.inMemoryCache.set(session.id, session);

    const now = new Date().toISOString();
    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          INSERT INTO staging_sessions (id, template_id, status, started_at, completed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            template_id = excluded.template_id,
            status = excluded.status,
            completed_at = excluded.completed_at,
            updated_at = excluded.updated_at
        `)
        .run(
          session.id,
          session.templateId ?? null,
          session.status,
          session.startedAt.toISOString(),
          session.completedAt?.toISOString() ?? null,
          now
        );

      this.db.prepare('DELETE FROM staging_sets WHERE session_id = ?').run(session.id);

      const insertSet = this.db.prepare(`
        INSERT INTO staging_sets (
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

  public async deleteDraft(sessionId: string): Promise<void> {
    this.inMemoryCache.delete(sessionId);
    this.db.prepare('DELETE FROM staging_sessions WHERE id = ?').run(sessionId);
  }

  public async cleanupExpiredDrafts(ttlMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000).toISOString();
    const result = this.db
      .prepare('DELETE FROM staging_sessions WHERE updated_at < ?')
      .run(cutoff);

    for (const [id] of this.inMemoryCache.entries()) {
      const exists = this.db.prepare('SELECT id FROM staging_sessions WHERE id = ?').get(id);
      if (!exists) {
        this.inMemoryCache.delete(id);
      }
    }

    return result.changes;
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
