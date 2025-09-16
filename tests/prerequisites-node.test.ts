import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteNode } from "../src/prerequisites/node";
import * as prereqs from "../src/prerequisites.service";

const base = tools.PackageVersion.fromString("20.0.0");

describe("prerequisites - node", () => {
  test("passes if current Node.js version is sufficient", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version: base, current: "v20.10.0" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("fails if current Node.js version is too low", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version: base, current: "v18.10.0" });

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toEqual("Version: 20.0.0");
  });

  test("fails if invalid Node.js version is passed", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version: base, current: "abc" });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Invalid version passed: abc" }),
    );
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteNode({
      label: "node",
      version: base,
      current: "v20.0.0",
      enabled: false,
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
