import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierMailerAdapter } from "../src/prerequisite-verifier-mailer.adapter";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() };
const deps = { Mailer };

const prerequisite = new PrerequisiteVerifierMailerAdapter(deps);

describe("PrerequisiteVerifierMailerAdapter", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(true);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("mailer");
  });
});
