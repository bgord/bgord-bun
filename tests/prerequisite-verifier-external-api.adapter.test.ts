import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierExternalApiAdapter } from "../src/prerequisite-verifier-external-api.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierExternalApiAdapter({ request: () => fetch("http://api") });

describe("PrerequisiteVerifierExternalApiAdapter", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - response not ok", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("failure - response error", async () => {
    // @ts-expect-error
    spyOn(global, "fetch").mockImplementation(mocks.throwIntentionalErrorAsync);

    const result = await prerequisite.verify();

    expect(result.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("external-api");
  });
});
