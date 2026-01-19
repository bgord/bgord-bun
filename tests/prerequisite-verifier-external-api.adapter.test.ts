import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierExternalApiAdapter } from "../src/prerequisite-verifier-external-api.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierExternalApiAdapter({ request: () => fetch("http://api") });

describe("PrerequisiteVerifierExternalApiAdapter", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response());

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - response not ok", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 400 }));

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("HTTP 400"));
  });

  test("failure - response error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("external-api");
  });
});
