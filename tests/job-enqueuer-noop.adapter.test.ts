import { describe, expect, test } from "bun:test";
import { JobEnqueuerNoopAdapter } from "../src/job-enqueuer-noop.adapter";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const serializer = new PayloadSerializerJsonAdapter();
const enqueuer = new JobEnqueuerNoopAdapter();

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: serializer.serialize(mocks.GenericSendEmailJob.payload),
};

describe("JobEnqueuerNoopAdapter", () => {
  test("enqueue", async () => {
    expect(await enqueuer.enqueue(serialized)).toEqual(serialized);
  });
});
