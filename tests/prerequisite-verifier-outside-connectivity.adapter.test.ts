import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierOutsideConnectivityAdapter } from "../src/prerequisite-verifier-outside-connectivity.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierOutsideConnectivityAdapter();

describe("PrerequisiteVerifierOutsideConnectivityAdapter", () => {
  test("success", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue(new Response());

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(globalFetch).toHaveBeenCalledWith("https://google.com", { method: "HEAD" });
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 400 }));

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("HTTP 400"));
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("outside-connectivity");
  });
});
