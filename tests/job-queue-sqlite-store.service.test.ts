import { describe, expect, test } from "bun:test";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";

const store = new JobQueueSqliteStore({ database: ":memory:" });

describe("JobQueueSqliteStore", () => {
  test("tables", () => {
    const tables = store.db
      .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'jobs'")
      .all();

    expect(tables).toEqual([{ name: "jobs" }]);
  });

  test("columns", () => {
    const columns = store.db.query("PRAGMA table_info(jobs)").all() as Array<{ name: string }>;
    const names = columns.map((column) => column.name);

    expect(names).toEqual([
      "id",
      "correlationId",
      "createdAt",
      "name",
      "revision",
      "payload",
      "status",
      "claimableAt",
    ]);
  });

  test("index", () => {
    const indexes = store.db
      .query("SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_jobs_claimable'")
      .all();

    expect(indexes).toEqual([{ name: "idx_jobs_claimable" }]);
  });

  test("idempotence", () => {
    new JobQueueSqliteStore({ database: ":memory:" });

    expect(() => new JobQueueSqliteStore({ database: ":memory:" })).not.toThrow();
  });
});
