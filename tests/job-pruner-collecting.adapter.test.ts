import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobPrunerCollectingAdapter } from "../src/job-pruner-collecting.adapter";

const cutoff = tools.Duration.Days(1);
const pruner = new JobPrunerCollectingAdapter();

describe("JobPrunerCollectingAdapter", () => {
  test("prune", async () => {
    await pruner.prune(cutoff);

    expect(pruner.pruned).toEqual([[cutoff, tools.Int.nonNegative(0)]]);
  });
});
