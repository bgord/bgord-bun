import { describe, expect, test } from "bun:test";
import { JobCompleterCollectingAdapter } from "../src/job-completer-collecting.adapter";
import * as mocks from "./mocks";

const completer = new JobCompleterCollectingAdapter();

describe("JobCompleterCollectingAdapter", () => {
  test("complete", async () => {
    await completer.complete(mocks.correlationId);

    expect(completer.completed).toEqual([mocks.correlationId]);
  });
});
