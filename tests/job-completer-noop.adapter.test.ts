import { describe, expect, test } from "bun:test";
import { JobCompleterNoopAdapter } from "../src/job-completer-noop.adapter";
import * as mocks from "./mocks";

const completer = new JobCompleterNoopAdapter();

describe("JobCompleterNoopAdapter", () => {
  test("complete", async () => {
    expect(async () => completer.complete(mocks.correlationId)).not.toThrow();
  });
});
