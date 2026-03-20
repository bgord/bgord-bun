import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSmsAdapter } from "../src/prerequisite-verifier-sms.adapter";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import * as mocks from "./mocks";

const Sms = new SmsNoopAdapter();
const prerequisite = new PrerequisiteVerifierSmsAdapter({ Sms });

describe("PrerequisiteVerifierSmsAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    using _ = spyOn(Sms, "verify").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("sms");
  });
});
