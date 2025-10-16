import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import { Binary } from "../src/binary.vo";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as prereqs from "../src/prerequisites.service";

const binary = Binary.parse("node");

describe("PrerequisiteBinary", () => {
  test("success - binary is found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 0 }) }));

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - binary is not found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 1 }) }));

    expect(await new PrerequisiteBinary({ label: "binary", binary }).verify()).toEqual(
      prereqs.Verification.failure({ message: `Exit code ${1}` }),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteBinary({ label: "binary", binary, enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
