import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRequeuerNoopAdapter } from "../src/job-requeuer-noop.adapter";
import * as mocks from "./mocks";

const requeuer = new JobRequeuerNoopAdapter();

describe("JobRequeuerNoopAdapter", () => {
  test("requeue", async () => {
    expect(async () => requeuer.requeue(mocks.correlationId, 1, tools.Duration.Seconds(5))).not.toThrow();
  });
});
