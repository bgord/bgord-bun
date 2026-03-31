import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobEnqueuerCollectingAdapter } from "../src/job-enqueuer-collecting.adapter";
import * as mocks from "./mocks";

const delay = tools.Duration.Seconds(5);

describe("JobEnqueuerCollectingAdapter", () => {
  test("enqueue", async () => {
    const enqueuer = new JobEnqueuerCollectingAdapter();

    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized);
    await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized, delay);

    expect(enqueuer.enqueued).toEqual([
      { job: mocks.GenericSendEmailJobSerialized, delay: undefined },
      { job: mocks.GenericSendEmailJobSerialized, delay },
    ]);
  });
});
