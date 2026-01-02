import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteVerifierMailerAdapter } from "../src/prerequisite-verifier-mailer.adapter";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() } as any;
const deps = { Mailer };

const prerequisite = new PrerequisiteVerifierMailerAdapter(deps);

describe("PrerequisiteVerifierMailerAdapter", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(() => Promise.resolve());

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(new Error(mocks.IntentionalError));

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toMatch(mocks.IntentionalError);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("mailer");
  });
});
