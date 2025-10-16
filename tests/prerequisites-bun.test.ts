import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteBun } from "../src/prerequisites/bun";
import * as prereqs from "../src/prerequisites.service";

const version = tools.PackageVersion.fromString("1.0.0");

describe("PrerequisiteBun", () => {
  test("success - Bun version is equal", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "1.0.0" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("success - Bun version is greater", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "1.1.0" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - Bun version is less", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteBun({ label: "bun", version, current: "0.1.0" }).verify()).error.message,
    ).toEqual("Version: 1.0.0");
  });

  test("failure - invalid Bun version", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "abc" }).verify()).toEqual(
      prereqs.Verification.failure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteBun({ label: "bun", enabled: false, version, current: "1.1.0" }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
