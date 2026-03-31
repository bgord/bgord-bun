import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobCompleterSqliteAdapter } from "../src/job-completer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobCompleterSqliteAdapter", () => {
  test("complete", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const completer = new JobCompleterSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await completer.complete(mocks.GenericSendEmailJob.id);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: "completed",
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });
});
