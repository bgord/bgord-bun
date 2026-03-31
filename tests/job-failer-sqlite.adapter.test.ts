import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobFailerSqliteAdapter } from "../src/job-failer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobFailerSqliteAdapter", () => {
  test("fail", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const failer = new JobFailerSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await failer.fail(mocks.GenericSendEmailJob.id);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: "failed",
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });
});
