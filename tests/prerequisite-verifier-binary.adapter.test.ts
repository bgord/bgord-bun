import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierBinaryAdapter } from "../src/prerequisite-verifier-binary.adapter";
import * as mocks from "./mocks";

const binary = Binary.parse("node");

const prerequisite = new PrerequisiteVerifierBinaryAdapter({ binary });

describe("PrerequisiteVerifierBinaryAdapter", () => {
  test("success", async () => {
    using _ = spyOn(Bun, "which").mockReturnValue(binary);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - binary not found", async () => {
    using _ = spyOn(Bun, "which").mockReturnValue(null);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure());
  });

  test("failure - error", async () => {
    using _ = spyOn(Bun, "which").mockImplementation(mocks.throwIntentionalError);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("binary");
  });
});
