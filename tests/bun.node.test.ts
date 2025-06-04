import { describe, expect, jest, mock, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteNode } from "../src/prerequisites/node";

describe("PrerequisiteNode", () => {
  test("passes if current Node.js version is sufficient", async () => {
    await mock.module("../src/shell", () => ({
      shell: async () => ({ stdout: "v20.10.0" }),
    }));

    const node = new PrerequisiteNode({
      label: "Node",
      version: new tools.PackageVersion(20, 0, 0),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    jest.restoreAllMocks();
  });

  test("fails if current Node.js version is too low", async () => {
    await mock.module("../src/shell", () => ({
      shell: async () => ({ stdout: "v16.10.0" }),
    }));

    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromStringWithV("v18.0.0"),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    jest.restoreAllMocks();
  });

  test("returns undetermined if disabled", async () => {
    const node = new PrerequisiteNode({
      label: "Node",
      version: new tools.PackageVersion(18, 0, 0),
      enabled: false,
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
