import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobCompleterSqliteAdapter } from "../src/job-completer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobFailerSqliteAdapter } from "../src/job-failer-sqlite.adapter";
import { JobPrunerSqliteAdapter } from "../src/job-pruner-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import { JobStatusEnum } from "../src/job-status.vo";
import * as mocks from "./mocks";

const cutoff = tools.Duration.Days(1);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobPrunerSqliteAdapter", () => {
  test("completed - not pruned", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const completer = new JobCompleterSqliteAdapter({ db: store.db });
    const pruner = new JobPrunerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await completer.complete(mocks.GenericSendEmailJob.id);
    const count = await pruner.prune(cutoff);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.completed,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("failed - not pruned", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const failer = new JobFailerSqliteAdapter({ db: store.db });
    const pruner = new JobPrunerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await failer.fail(mocks.GenericSendEmailJob.id);
    const count = await pruner.prune(cutoff);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.failed,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("completed - pruned", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const completer = new JobCompleterSqliteAdapter({ db: store.db });
    const pruner = new JobPrunerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await completer.complete(mocks.GenericSendEmailJob.id);
    Clock.advanceBy(cutoff);
    const count = await pruner.prune(cutoff);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(1));
    expect(rows.length).toEqual(0);
  });

  test("failed - pruned", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const failer = new JobFailerSqliteAdapter({ db: store.db });
    const pruner = new JobPrunerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await failer.fail(mocks.GenericSendEmailJob.id);
    Clock.advanceBy(cutoff);
    const count = await pruner.prune(cutoff);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(1));
    expect(rows.length).toEqual(0);
  });

  test("pending - not pruned at all", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const pruner = new JobPrunerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    Clock.advanceBy(cutoff);
    const count = await pruner.prune(cutoff);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.pending,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });
});
