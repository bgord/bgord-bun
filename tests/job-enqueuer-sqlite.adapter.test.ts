import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import * as mocks from "./mocks";

const delay = tools.Duration.Seconds(5);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobEnqueuerSqliteAdapter", () => {
  test("enqueue", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);

    expect(store.db.query("SELECT * FROM jobs").all()).toEqual([
      { ...mocks.GenericSendEmailJobSerialized, status: "pending", claimableAt: mocks.TIME_ZERO.ms },
    ]);
  });

  test("enqueue - with delay", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized, delay);

    expect(store.db.query("SELECT * FROM jobs").all()).toEqual([
      {
        ...mocks.GenericSendEmailJobSerialized,
        status: "pending",
        claimableAt: mocks.TIME_ZERO.add(delay).ms,
      },
    ]);
  });

  test("enqueue - duplicate id", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    expect(async () => enqueuer.enqueue(mocks.GenericSendEmailJobSerialized)).toThrow();
  });
});
