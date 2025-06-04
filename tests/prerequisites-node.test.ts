import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as shell from "../src/shell";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteNode } from "../src/prerequisites/node";

describe("PrerequisiteNode", () => {
  test("passes if current Node.js version is sufficient", async () => {
    // @ts-expect-error
    const shellSpy = spyOn(shell, "shell").mockResolvedValue({
      stdout: Buffer.from("v20.10.0"),
    });

    const node = new PrerequisiteNode({
      label: "Node",
      version: new tools.PackageVersion(20, 0, 0),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    shellSpy.mockRestore();
  });

  test("fails if current Node.js version is too low", async () => {
    // @ts-expect-error
    const shellSpy = spyOn(shell, "shell").mockResolvedValue({
      stdout: Buffer.from("v16.10.0"),
    });

    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromStringWithV("v18.0.0"),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    shellSpy.mockRestore();
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
