import { describe, expect, test } from "bun:test";
import { JobFailerCollectingAdapter } from "../src/job-failer-collecting.adapter";
import * as mocks from "./mocks";

const failer = new JobFailerCollectingAdapter();

describe("JobFailerCollectingAdapter", () => {
  test("fail", async () => {
    await failer.fail(mocks.correlationId);

    expect(failer.failed).toEqual([mocks.correlationId]);
  });
});
