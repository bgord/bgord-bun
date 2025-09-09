import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteNode } from "../src/prerequisites/node";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - node", () => {
  test("passes if current Node.js version is sufficient", async () => {
    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromString("20.0.0"),
      current: "v20.10.0",
    });

    const result = await node.verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("fails if current Node.js version is too low", async () => {
    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromString("18.0.0"),
      current: "v16.10.0",
    });

    const result = await node.verify();
    // @ts-expect-error
    expect(result.error.message).toEqual("Version: 18.0.0");
  });

  test("fails if invalid Node.js version is passed", async () => {
    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromString("18.0.0"),
      current: "abc",
    });

    const result = await node.verify();
    expect(result).toEqual(prereqs.Verification.failure({ message: "Invalid version passed: abc" }));
  });

  test("returns undetermined if disabled", async () => {
    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromString("18.0.0"),
      current: "v20.0.0",
      enabled: false,
    });

    const result = await node.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
