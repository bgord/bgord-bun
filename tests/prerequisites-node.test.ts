import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteNode } from "../src/prerequisites/node";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("20.0.0");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteNode", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version, current: "v20.0.0" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version, current: "v20.10.0" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version, current: "v18.10.0" });

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toEqual("Version: v18.10.0");
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteNode({ label: "node", version, current: "abc" });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteNode({
      label: "node",
      version,
      current: "v20.0.0",
      enabled: false,
    });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
