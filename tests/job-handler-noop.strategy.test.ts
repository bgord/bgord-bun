import { describe, expect, spyOn, test } from "bun:test";
import { JobHandlerNoopStrategy } from "../src/job-handler-noop.strategy";
import * as mocks from "./mocks";

const handler = new JobHandlerNoopStrategy();

describe("JobHandlerNoopStrategy", () => {
  test("happy path", async () => {
    using task = spyOn(mocks.task, "handler");

    expect(async () => handler.handle(mocks.task).handler()).not.toThrow();
    expect(task).not.toHaveBeenCalled();
  });

  test("failure", async () => {
    using _ = spyOn(mocks.task, "handler").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => handler.handle(mocks.task).handler()).not.toThrow(mocks.IntentionalError);
  });
});
