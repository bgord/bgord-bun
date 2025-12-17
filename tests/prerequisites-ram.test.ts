import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(512);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteRAM", () => {
  test("success", async () => {
    spyOn(os, "freemem").mockReturnValue(tools.Size.fromMB(513).toBytes());
    const prerequisite = new PrerequisiteRAM({ label: "ram", minimum });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());
    const prerequisite = new PrerequisiteRAM({ label: "ram", minimum });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteRAM({ label: "ram", enabled: false, minimum });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
