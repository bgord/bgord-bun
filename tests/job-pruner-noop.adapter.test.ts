import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobPrunerNoopAdapter } from "../src/job-pruner-noop.adapter";

const cutoff = tools.Duration.Days(1);
const pruner = new JobPrunerNoopAdapter();

describe("JobPrunerNoopAdapter", () => {
  test("prune", async () => {
    expect(async () => pruner.prune(cutoff)).not.toThrow();
  });
});
