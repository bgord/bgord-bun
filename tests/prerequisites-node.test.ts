import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteNode } from "../src/prerequisites/node";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("20.0.0");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteNode", () => {
  test("success - Node.js version is equal", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "v20.0.0" }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("success - Node.js version is greater", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "v20.10.0" }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - Node.js version is too low", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteNode({ label: "node", version, current: "v18.10.0" }).verify(Clock)).error
        .message,
    ).toEqual("Version: v18.10.0");
  });

  test("failure - invalid Node.js version is passed", async () => {
    expect(await new PrerequisiteNode({ label: "node", version, current: "abc" }).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteNode({
        label: "node",
        version,
        current: "v20.0.0",
        enabled: false,
      }).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
