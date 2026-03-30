import { describe, expect, test } from "bun:test";
import { JobFailerNoopAdapter } from "../src/job-failer-noop.adapter";
import * as mocks from "./mocks";

const failer = new JobFailerNoopAdapter();

describe("JobFailerNoopAdapter", () => {
  test("fail", async () => {
    expect(async () => failer.fail(mocks.correlationId)).not.toThrow();
  });
});
