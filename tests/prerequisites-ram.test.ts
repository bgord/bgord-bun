import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - ram", () => {
  test("verify method returns success for valid RAM", async () => {
    spyOn(os, "freemem").mockReturnValue(new tools.Size({ unit: tools.SizeUnit.GB, value: 1 }).toBytes());

    const result = await new PrerequisiteRAM({
      label: "ram",
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    }).verify();

    expect(result).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for insufficient RAM", async () => {
    const freeRAM = new tools.Size({ value: 256, unit: tools.SizeUnit.MB });
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());

    const result = await new PrerequisiteRAM({
      label: "ram",
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    }).verify();

    expect(result).toEqual(
      prereqs.Verification.failure({ message: `Free RAM: ${freeRAM.format(tools.SizeUnit.MB)}` }),
    );
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteRAM({
      label: "prerequisite",
      enabled: false,
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    });

    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
