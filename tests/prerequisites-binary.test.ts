import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import { Binary } from "../src/binary.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const binary = Binary.parse("node");
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteBinary", () => {
  test("success - binary is found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 0 }) }));

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - binary is not found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 1 }) }));

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify(clock)).toEqual(
      prereqs.Verification.failure({ message: `Exit code ${1}` }),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteBinary({ label: "binary", binary, enabled: false }).verify(clock)).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
