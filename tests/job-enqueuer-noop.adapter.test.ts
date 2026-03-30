import { describe, expect, test } from "bun:test";
import { JobEnqueuerNoopAdapter } from "../src/job-enqueuer-noop.adapter";
import * as mocks from "./mocks";

const enqueuer = new JobEnqueuerNoopAdapter();

const serialized = {
  ...mocks.GenericSendEmailJob,
  // TODO: use a serializer
  payload: JSON.stringify(mocks.GenericSendEmailJob.payload),
};

describe("JobEnqueuerNoopAdapter", () => {
  test("enqueue", async () => {
    expect(await enqueuer.enqueue([serialized])).toEqual([serialized]);
  });
});
