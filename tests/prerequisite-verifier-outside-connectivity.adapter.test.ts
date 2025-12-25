import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierOutsideConnectivityAdapter } from "../src/prerequisite-verifier-outside-connectivity.adapter";
import { PrerequisiteVerificationOutcome } from "../src/prerequisites.service";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierOutsideConnectivityAdapter", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter({});

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);
    const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter({});

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter({});

    expect(
      // @ts-expect-error
      (await prerequisite.verify()).error.message,
    ).toMatch(mocks.IntentionalError);
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(global, "fetch").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter({
      timeout: tools.Duration.Ms(5),
    });

    expect((await prerequisite.verify()).outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
