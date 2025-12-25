import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierExternalApiAdapter } from "../src/prerequisite-verifier-external-api.adapter";
import { PrerequisiteVerificationOutcome } from "../src/prerequisites.service";
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

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(global, "fetch").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteVerifierExternalApiAdapter({
      timeout: tools.Duration.Ms(5),
      request: (signal: AbortSignal) => fetch("http://api", { signal }),
    });

    expect((await prerequisite.verify()).outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
