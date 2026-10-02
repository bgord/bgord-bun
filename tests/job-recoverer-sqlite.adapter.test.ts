import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobClaimerSqliteAdapter } from "../src/job-claimer-sqlite.adapter";
import { JobCompleterSqliteAdapter } from "../src/job-completer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobFailerSqliteAdapter } from "../src/job-failer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import { JobRecovererSqliteAdapter } from "../src/job-recoverer-sqlite.adapter";
import { JobStatusEnum } from "../src/job-status.vo";
import * as mocks from "./mocks";

const limit = tools.Int.positive(10);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobRecovererSqliteAdapter", () => {
  test("claimed - recovered", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });
    const recoverer = new JobRecovererSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await claimer.claim([mocks.GenericSendEmailJob.name], limit);
    const count = await recoverer.recover();

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(1));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.pending,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("pending - not recovered", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const recoverer = new JobRecovererSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    const count = await recoverer.recover();

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.pending,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("completed - not recovered", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const completer = new JobCompleterSqliteAdapter({ db: store.db });
    const recoverer = new JobRecovererSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await completer.complete(mocks.GenericSendEmailJob.id);
    const count = await recoverer.recover();

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.completed,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("failed - not recovered", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const failer = new JobFailerSqliteAdapter({ db: store.db });
    const recoverer = new JobRecovererSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await failer.fail(mocks.GenericSendEmailJob.id);
    const count = await recoverer.recover();

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(count).toEqual(tools.Int.nonNegative(0));
    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: JobStatusEnum.failed,
      claimableAt: mocks.TIME_ZERO.ms,
    });
  });

  test("recovered - claimable again", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });
    const recoverer = new JobRecovererSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await claimer.claim([mocks.GenericSendEmailJob.name], limit);
    await recoverer.recover();
    const claimed = await claimer.claim([mocks.GenericSendEmailJob.name], limit);

    expect(claimed).toEqual([mocks.GenericSendEmailJobSerialized]);
  });
});
