import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(512);
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteRAM", () => {
  test("success", async () => {
    spyOn(os, "freemem").mockReturnValue(tools.Size.fromMB(513).toBytes());

    expect(await new PrerequisiteRAM({ label: "ram", minimum }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());

    expect(await new PrerequisiteRAM({ label: "ram", minimum }).verify(clock)).toEqual(
      mocks.VerificationFailure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` }),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteRAM({ label: "ram", enabled: false, minimum }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
