import Database from 'better-sqlite3';
import path from 'path';

export class SQLiteConnectionFactory {
  private static stagingInstance: Database.Database | null = null;
  private static permanentInstance: Database.Database | null = null;

  public static getStagingDb(customPath?: string): Database.Database {
    if (customPath) {
      const db = new Database(customPath);
      this.initStagingSchema(db);
      return db;
    }
    if (!this.stagingInstance) {
      const dbPath = path.resolve(process.cwd(), 'databases', 'staging.db');
      this.stagingInstance = new Database(dbPath);
      this.initStagingSchema(this.stagingInstance);
    }
    return this.stagingInstance;
  }

  public static getPermanentDb(customPath?: string): Database.Database {
    if (customPath) {
      const db = new Database(customPath);
      this.initPermanentSchema(db);
      return db;
    }
    if (!this.permanentInstance) {
      const dbPath = path.resolve(process.cwd(), 'databases', 'gym_assistant.db');
      this.permanentInstance = new Database(dbPath);
      this.initPermanentSchema(this.permanentInstance);
    }
    return this.permanentInstance;
  }

  public static initStagingSchema(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS staging_sessions (
        id TEXT PRIMARY KEY,
        template_id TEXT,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS staging_sets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        weight_unit TEXT NOT NULL DEFAULT 'kg',
        repetitions INTEGER NOT NULL,
        is_warmup INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        rest_time_seconds INTEGER,
        FOREIGN KEY (session_id) REFERENCES staging_sessions (id) ON DELETE CASCADE
      );
    `);
  }

  public static initPermanentSchema(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image_path TEXT,
        multipliers_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        items_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS completed_sessions (
        id TEXT PRIMARY KEY,
        template_id TEXT,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS completed_sets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        weight_unit TEXT NOT NULL DEFAULT 'kg',
        repetitions INTEGER NOT NULL,
        is_warmup INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        rest_time_seconds INTEGER,
        FOREIGN KEY (session_id) REFERENCES completed_sessions (id) ON DELETE CASCADE
      );
    `);
  }
}
