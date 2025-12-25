import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteVerifierMailerAdapter } from "../src/prerequisite-verifier-mailer.adapter";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() } as any;
const deps = { Mailer };

describe("PrerequisiteVerifierMailerAdapter", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(() => Promise.resolve());
    const prerequisite = new PrerequisiteVerifierMailerAdapter(deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteVerifierMailerAdapter(deps);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(mocks.IntentionalError);
  });
});
