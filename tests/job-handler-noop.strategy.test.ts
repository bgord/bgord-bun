import { describe, expect, spyOn, test } from "bun:test";
import { JobHandlerNoopStrategy } from "../src/job-handler-noop.strategy";
import * as mocks from "./mocks";

const handler = new JobHandlerNoopStrategy();

describe("JobHandlerNoopStrategy", () => {
  test("happy path", async () => {
    const uow = { label: "PassageOfTime", process: async () => {} };
    using uowProcess = spyOn(uow, "process");

    expect(async () => handler.handle(uow)()).not.toThrow();
    expect(uowProcess).not.toHaveBeenCalled();
  });

  test("failure", async () => {
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    expect(async () => handler.handle(uow)()).not.toThrow(mocks.IntentionalError);
  });
});
