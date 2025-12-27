import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerifierOutsideConnectivityAdapter } from "../src/prerequisite-verifier-outside-connectivity.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter();

describe("PrerequisiteVerifierOutsideConnectivityAdapter", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toMatch(mocks.IntentionalError);
  });
});
