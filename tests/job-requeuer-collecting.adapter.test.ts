import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRequeuerCollectingAdapter } from "../src/job-requeuer-collecting.adapter";
import * as mocks from "./mocks";

const delay = tools.Duration.Seconds(5);
const requeuer = new JobRequeuerCollectingAdapter();

describe("JobRequeuerCollectingAdapter", () => {
  test("requeue", async () => {
    await requeuer.requeue(mocks.correlationId, 1, delay);

    expect(requeuer.requeued).toEqual([{ id: mocks.correlationId, revision: 1, delay }]);
  });
});
