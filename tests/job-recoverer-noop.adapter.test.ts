import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRecovererNoopAdapter } from "../src/job-recoverer-noop.adapter";

const recoverer = new JobRecovererNoopAdapter();

describe("JobRecovererNoopAdapter", () => {
  test("recover", async () => {
    expect(await recoverer.recover()).toEqual(tools.Int.nonNegative(0));
  });
});
