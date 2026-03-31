import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobClaimerNoopAdapter } from "../src/job-claimer-noop.adapter";
import * as mocks from "./mocks";

const limit = tools.Int.positive(3);

describe("JobClaimerNoopAdapter", () => {
  test("claim - empty", async () => {
    const claimer = new JobClaimerNoopAdapter();

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([]);
  });

  test("claim", async () => {
    const claimer = new JobClaimerNoopAdapter([mocks.GenericSendEmailJobSerialized]);

    expect(await claimer.claim([mocks.GenericSendEmailJob.name], limit)).toEqual([
      mocks.GenericSendEmailJobSerialized,
    ]);
  });
});
