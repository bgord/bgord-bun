import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { JobClaimerSqliteAdapter } from "../src/job-claimer-sqlite.adapter";
import { JobEnqueuerSqliteAdapter } from "../src/job-enqueuer-sqlite.adapter";
import { JobQueueSqliteStore } from "../src/job-queue-sqlite-store.service";
import { JobRequeuerSqliteAdapter } from "../src/job-requeuer-sqlite.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const limit = tools.Int.positive(10);
const delay = tools.Duration.Seconds(30);

describe("JobRequeuerSqliteAdapter", () => {
  test("requeue", async () => {
    const store = new JobQueueSqliteStore({ database: ":memory:" });
    const enqueuer = new JobEnqueuerSqliteAdapter({ db: store.db, Clock });
    const requeuer = new JobRequeuerSqliteAdapter({ db: store.db, Clock });
    const claimer = new JobClaimerSqliteAdapter({ db: store.db, Clock });

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await requeuer.requeue(mocks.GenericSendEmailJob.id, 1, delay);

    const rows = store.db.query("SELECT * FROM jobs WHERE id = ?").all(mocks.GenericSendEmailJob.id);

    expect(rows[0]).toEqual({
      ...mocks.GenericSendEmailJobSerialized,
      status: "pending",
      claimableAt: mocks.TIME_ZERO.add(delay).ms,
      revision: 1,
    });

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([]);

    Clock.advanceBy(delay);

    const result = await claimer.claim([mocks.GenericSendEmailJob.name], limit);

    expect(result).toEqual([{ ...mocks.GenericSendEmailJobSerialized, revision: 1 }]);
  });
});
