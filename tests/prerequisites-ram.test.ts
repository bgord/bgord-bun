import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as prereqs from "../src/prerequisites.service";

const minimum = tools.Size.fromMB(512);

describe("prerequisites - ram", () => {
  test("verify method returns success for valid RAM", async () => {
    spyOn(os, "freemem").mockReturnValue(new tools.Size({ unit: tools.SizeUnit.GB, value: 1 }).toBytes());

    const prerequisite = new PrerequisiteRAM({ label: "ram", minimum });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for insufficient RAM", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());

    const prerequisite = new PrerequisiteRAM({ label: "ram", minimum });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: `Free RAM: ${freeRAM.format(tools.SizeUnit.MB)}` }),
    );
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteRAM({ label: "prerequisite", enabled: false, minimum });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
