import { describe, expect, test } from "bun:test";
import { JobEnqueuerNoopAdapter } from "../src/job-enqueuer-noop.adapter";
import * as mocks from "./mocks";

const enqueuer = new JobEnqueuerNoopAdapter();

describe("JobEnqueuerNoopAdapter", () => {
  test("enqueue", async () => {
    expect(await enqueuer.enqueue(mocks.GenericSendEmailJobSerialized)).toEqual(
      mocks.GenericSendEmailJobSerialized,
    );
  });
});
