import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerifierExternalApiAdapter } from "../src/prerequisite-verifier-external-api.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierExternalApiAdapter", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    const prerequisite = new PrerequisiteVerifierExternalApiAdapter({ request: () => fetch("http://api") });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);
    const prerequisite = new PrerequisiteVerifierExternalApiAdapter({ request: () => fetch("http://api") });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });
});
