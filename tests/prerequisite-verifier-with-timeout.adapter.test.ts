import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierWithTimeoutAdapter } from "../src/prerequisite-verifier-with-timeout.adapter";
import { TimeoutError } from "../src/timeout.service";
import * as mocks from "./mocks";

const timeout = tools.Duration.Ms(1);

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();

describe("PrerequisiteVerifierWithTimeoutAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: fail, timeout });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(pass, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(5).ms));
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout });

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toEqual(TimeoutError.Exceeded);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
