import { describe, expect, spyOn, test } from "bun:test";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import { JobHandlerBareStrategy } from "../src/job-handler-bare.strategy";
import * as mocks from "./mocks";

const IdProvider = new IdProviderCryptoAdapter();
const deps = { IdProvider };

const handler = new JobHandlerBareStrategy(deps);

describe("JobHandlerBareStrategy", () => {
  test("happy path", async () => {
    const uow = { label: "PassageOfTime", process: async () => {} };
    using uowProcess = spyOn(uow, "process");

    expect(async () => handler.handle(uow)()).not.toThrow();
    expect(uowProcess).toHaveBeenCalled();
  });

  test("failure", async () => {
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    expect(async () => handler.handle(uow)()).toThrow(mocks.IntentionalError);
  });
});
