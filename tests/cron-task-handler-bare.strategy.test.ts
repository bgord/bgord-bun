import { describe, expect, spyOn, test } from "bun:test";
import { CronTaskHandlerBareStrategy } from "../src/cron-task-handler-bare.strategy";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as mocks from "./mocks";

const IdProvider = new IdProviderCryptoAdapter();
const deps = { IdProvider };

const handler = new CronTaskHandlerBareStrategy(deps);

describe("CronTaskHandlerBareStrategy", () => {
  test("happy path", async () => {
    using task = spyOn(mocks.task, "handler");

    expect(async () => handler.handle(mocks.task).handler()).not.toThrow();
    expect(task).toHaveBeenCalled();
  });

  test("happy path - correlation id per run", async () => {
    using idProviderGenerate = spyOn(IdProvider, "generate");
    const task = handler.handle(mocks.task);

    await task.handler();
    await task.handler();

    expect(idProviderGenerate).toHaveBeenCalledTimes(2);
  });

  test("failure", async () => {
    using _ = spyOn(mocks.task, "handler").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => handler.handle(mocks.task).handler()).toThrow(mocks.IntentionalError);
  });
});
