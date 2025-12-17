import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as mocks from "./mocks";

const binary = Binary.parse("node");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteBinary", () => {
  test("success", async () => {
    spyOn(Bun, "which").mockReturnValue(binary);
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - binary not found", async () => {
    spyOn(Bun, "which").mockReturnValue(null);
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationFailure());
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
