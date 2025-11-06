import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as mocks from "./mocks";

const binary = Binary.parse("node");
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteBinary", () => {
  test("success - binary is found", async () => {
    spyOn(Bun, "which").mockReturnValue(binary);

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - binary is not found", async () => {
    spyOn(Bun, "which").mockReturnValue(null);

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify(clock)).toEqual(
      mocks.VerificationFailure(),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteBinary({ label: "binary", binary, enabled: false }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
