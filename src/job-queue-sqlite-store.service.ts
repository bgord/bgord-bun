import { Database } from "bun:sqlite";

type Config = { database: string };

export class JobQueueSqliteStore {
  readonly db: Database;

  constructor(config: Config) {
    this.db = new Database(config.database);

    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        correlationId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        name TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 0,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        claimableAt INTEGER NOT NULL DEFAULT 0
      )
    `);
    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_jobs_claimable
       ON jobs (status, name, claimableAt, createdAt)`,
    );
  }
}
