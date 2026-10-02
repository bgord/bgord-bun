import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRecovererCollectingAdapter } from "../src/job-recoverer-collecting.adapter";

const recoverer = new JobRecovererCollectingAdapter();

describe("JobRecovererCollectingAdapter", () => {
  test("recover", async () => {
    await recoverer.recover();

    expect(recoverer.recovered).toEqual([tools.Int.nonNegative(0)]);
  });
});
