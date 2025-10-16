import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteNode } from "../src/prerequisites/node";
import * as prereqs from "../src/prerequisites.service";

const version = tools.PackageVersion.fromString("20.0.0");

describe("PrerequisiteNode", () => {
  test("success - Node.js version is equal", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "v20.0.0" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("success - Node.js version is greater", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "v20.10.0" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - Node.js version is too low", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteNode({ label: "node", version, current: "v18.10.0" }).verify()).error.message,
    ).toEqual("Version: v18.10.0");
  });

  test("failure - invalid Node.js version is passed", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "abc" }).verify()).toEqual(
      prereqs.Verification.failure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteNode({
        label: "node",
        version,
        current: "v20.0.0",
        enabled: false,
      }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
