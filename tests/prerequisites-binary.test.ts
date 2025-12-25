import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as mocks from "./mocks";

const binary = Binary.parse("node");

describe("PrerequisiteBinary", () => {
  test("success", async () => {
    spyOn(Bun, "which").mockReturnValue(binary);
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - binary not found", async () => {
    spyOn(Bun, "which").mockReturnValue(null);
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary, enabled: false });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
