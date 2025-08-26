import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import * as tools from "@bgord/tools";
import { PrerequisiteNode } from "../src/prerequisites/node";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - node", () => {
  test("passes if current Node.js version is sufficient", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        stdout: Buffer.from("v20.10.0"),
      }),
    }));

    const node = new PrerequisiteNode({
      label: "Node",
      version: new tools.PackageVersion(20, 0, 0),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("fails if current Node.js version is too low", async () => {
    spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error
      quiet: () => ({
        stdout: Buffer.from("v16.10.0"),
      }),
    }));

    const node = new PrerequisiteNode({
      label: "Node",
      version: tools.PackageVersion.fromStringWithV("v18.0.0"),
    });

    const result = await node.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
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
