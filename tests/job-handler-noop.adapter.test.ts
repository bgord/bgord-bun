import { describe, expect, spyOn, test } from "bun:test";
import { JobHandlerNoop } from "../src/job-handler-noop.adapter";
import * as mocks from "./mocks";

const handler = new JobHandlerNoop();

describe("JobHandlerBare", () => {
  test("happy path", async () => {
    const uow = { label: "PassageOfTime", process: async () => {} };
    const uowProcess = spyOn(uow, "process");

    expect(async () => handler.handle(uow)()).not.toThrow();
    expect(uowProcess).not.toHaveBeenCalled();
  });

  test("failure", async () => {
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    expect(async () => handler.handle(uow)()).not.toThrow(mocks.IntentionalError);
  });
});
