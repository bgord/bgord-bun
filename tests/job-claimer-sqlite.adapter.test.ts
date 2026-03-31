import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobClaimerSqliteAdapter } from "../src/job-claimer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import * as mocks from "./mocks";

const limit = tools.Int.positive(10);
const delay = tools.Duration.Seconds(60);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobClaimerSqliteAdapter", () => {
  test("claim - no jobs", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([]);
  });

  test("claim - one job", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([
      mocks.GenericSendEmailJobSerialized,
    ]);

    const rows = store.db
      .query("SELECT * FROM jobs WHERE id = ?")
      .all(mocks.GenericSendEmailJobSerialized.id);

    expect(rows).toEqual([
      { ...mocks.GenericSendEmailJobSerialized, status: "claimed", claimableAt: mocks.TIME_ZERO.ms },
    ]);
  });

  test("claim - limit", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "a" });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "b" });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "c" });
    const result = await claimer.claim([mocks.GenericSendEmailJob.name], tools.Int.positive(2));

    expect(result.length).toEqual(2);
  });

  test("claim - multiple job names", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });
    const names = [mocks.GenericSendEmailJob.name, "sms"];

    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "a" });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "b", name: "sms" });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "c" });
    const result = await claimer.claim(names, tools.Int.positive(2));

    expect(result.length).toEqual(2);
  });

  test("claim - ordering", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "late", createdAt: 2 });
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "early", createdAt: 1 });

    const result = await claimer.claim([mocks.GenericSendEmailJob.name], limit);

    expect(result[0]?.id).toEqual("early");
    expect(result[1]?.id).toEqual("late");
  });

  test("claim - delay", async () => {
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized, delay);

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([]);

    Clock.advanceBy(delay);

    expect((await claimer.claim([mocks.GenericSendEmailJob.name], limit)).length).toEqual(1);
  });

  test("claim - filtering", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await enqueuer.enqueue({ ...mocks.GenericSendEmailJobSerialized, id: "a", name: "REPORT_JOB" });

    const result = await claimer.claim([mocks.GenericSendEmailJob.name], limit);

    expect(result.length).toEqual(1);
    expect(result[0]?.name).toEqual(mocks.GenericSendEmailJob.name);
  });

  test("claim - locking", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await claimer.claim([mocks.GenericSendEmailJob.name], limit);

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([]);
  });
});
