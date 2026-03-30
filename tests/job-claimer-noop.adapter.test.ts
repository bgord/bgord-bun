import { describe, expect, test } from "bun:test";
import { JobClaimerNoopAdapter } from "../src/job-claimer-noop.adapter";
import * as mocks from "./mocks";

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: JSON.stringify(mocks.GenericSendEmailJob.payload),
};

describe("JobClaimerNoopAdapter", () => {
  test("claim - empty", async () => {
    const claimer = new JobClaimerNoopAdapter();

    expect(await claimer.claim([mocks.GenericSendEmailJob.name])).toEqual([]);
  });

  test("claim", async () => {
    const claimer = new JobClaimerNoopAdapter([serialized]);

    expect(await claimer.claim([mocks.GenericSendEmailJob.name])).toEqual([serialized]);
  });
});
