import { describe, expect, spyOn, test } from "bun:test";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import { JobHandlerBare } from "../src/job-handler-bare.adapter";
import * as mocks from "./mocks";

const IdProvider = new IdProviderCryptoAdapter();
const deps = { IdProvider };

const handler = new JobHandlerBare(deps);

describe("JobHandlerBare", () => {
  test("happy path", async () => {
    const uow = { label: "PassageOfTime", process: async () => {} };
    const uowProcess = spyOn(uow, "process");

    expect(async () => handler.handle(uow)()).not.toThrow();
    expect(uowProcess).toHaveBeenCalled();
  });

  test("failure", async () => {
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    expect(async () => handler.handle(uow)()).toThrow(mocks.IntentionalError);
  });
});
