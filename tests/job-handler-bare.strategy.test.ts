import { describe, expect, spyOn, test } from "bun:test";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import { JobHandlerBareStrategy } from "../src/job-handler-bare.strategy";
import * as mocks from "./mocks";

const IdProvider = new IdProviderCryptoAdapter();
const deps = { IdProvider };

const handler = new JobHandlerBareStrategy(deps);

describe("JobHandlerBareStrategy", () => {
  test("happy path", async () => {
    using task = spyOn(mocks.task, "handler");

    expect(async () => handler.handle(mocks.task).handler()).not.toThrow();
    expect(task).toHaveBeenCalled();
  });

  test("failure", async () => {
    using _ = spyOn(mocks.task, "handler").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => handler.handle(mocks.task).handler()).toThrow(mocks.IntentionalError);
  });
});
