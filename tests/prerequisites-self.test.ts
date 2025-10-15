import { describe, expect, test } from "bun:test";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - self", () => {
  test("success", async () => {
    expect(await new PrerequisiteSelf({ label: "self" }).verify()).toEqual(prereqs.Verification.success());
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteSelf({ label: "self", enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
