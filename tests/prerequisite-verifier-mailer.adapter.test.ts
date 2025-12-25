import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierMailerAdapter } from "../src/prerequisite-verifier-mailer.adapter";
import { PrerequisiteVerificationOutcome } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() } as any;
const deps = { Mailer };

describe("PrerequisiteVerifierMailerAdapter", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(() => Promise.resolve());
    const prerequisite = new PrerequisiteVerifierMailerAdapter({ label: "mailer" }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteVerifierMailerAdapter({ label: "mailer" }, deps);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(mocks.IntentionalError);
  });

  test("undetermined - timeout", async () => {
    spyOn(Mailer, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteVerifierMailerAdapter(
      { label: "mailer", timeout: tools.Duration.Ms(5) },
      deps,
    );

    expect((await prerequisite.verify()).outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
