import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobClaimerSqliteAdapter } from "../src/job-claimer-sqlite.adapter";
import { JobCompleterSqliteAdapter } from "../src/job-completer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobFailerSqliteAdapter } from "../src/job-failer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import { JobQueueStatsProviderSqliteAdapter } from "../src/job-queue-stats-provider-sqlite.adapter";
import * as mocks from "./mocks";

const zero = tools.Int.nonNegative(0);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const snapshot = { pending: zero, claimed: zero, completed: zero, failed: zero, oldestPending: null };

describe("JobQueueStatsProviderSqliteAdapter", () => {
  test("empty queue", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    expect(await stats.getStats()).toEqual(snapshot);
  });

  test("pending", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);

    expect(await stats.getStats()).toEqual({
      ...snapshot,
      pending: tools.Int.nonNegative(1),
      oldestPending: mocks.TIME_ZERO.ms,
    });
  });

  test("claimed", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await claimer.claim([mocks.GenericSendEmailJobSerialized.name], tools.Int.positive(1));

    expect(await stats.getStats()).toEqual({ ...snapshot, claimed: tools.Int.nonNegative(1) });
  });

  test("completed", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const completer = new JobCompleterSqliteAdapter({ db: store.db });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await completer.complete(mocks.GenericSendEmailJob.id);

    expect(await stats.getStats()).toEqual({ ...snapshot, completed: tools.Int.nonNegative(1) });
  });

  test("failed", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const failer = new JobFailerSqliteAdapter({ db: store.db });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await failer.fail(mocks.GenericSendEmailJob.id);

    expect(await stats.getStats()).toEqual({ ...snapshot, failed: tools.Int.nonNegative(1) });
  });

  test("oldest pending", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const stats = new JobQueueStatsProviderSqliteAdapter({ db: store.db });

    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "old", createdAt: 1000 });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "new", createdAt: 2000 });

    expect(await stats.getStats()).toEqual({
      ...snapshot,
      pending: tools.Int.nonNegative(2),
      oldestPending: tools.Timestamp.fromNumber(1000).ms,
    });
  });
});
