import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobEnqueuerCollectingAdapter } from "../src/job-enqueuer-collecting.adapter";
import * as mocks from "./mocks";

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: JSON.stringify(mocks.GenericSendEmailJob.payload),
};

const delay = tools.Duration.Seconds(5);

describe("JobEnqueuerCollectingAdapter", () => {
  test("enqueue", async () => {
    const enqueuer = new JobEnqueuerCollectingAdapter();

    await enqueuer.enqueue(serialized);
    await enqueuer.enqueue(serialized, delay);

    expect(enqueuer.enqueued).toEqual([
      { job: serialized, delay: undefined },
      { job: serialized, delay },
    ]);
  });
});
