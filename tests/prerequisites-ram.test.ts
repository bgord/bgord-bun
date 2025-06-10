import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";

import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisiteRAM } from "../src/prerequisites/ram";

describe("prerequisites - ram", () => {
  test("verify method returns success for valid RAM", async () => {
    const osFreemem = spyOn(os, "freemem").mockReturnValue(
      new tools.Size({ unit: tools.SizeUnit.GB, value: 1 }).toBytes(),
    );

    const result = await new PrerequisiteRAM({
      label: "ram",
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);

    osFreemem.mockRestore();
  });

  test("verify method returns failure for insufficient RAM", async () => {
    const osFreemem = spyOn(os, "freemem").mockReturnValue(
      new tools.Size({ value: 256, unit: tools.SizeUnit.MB }).toBytes(),
    );

    const result = await new PrerequisiteRAM({
      label: "ram",
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    osFreemem.mockRestore();
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteRAM({
      label: "prerequisite",
      enabled: false,
      minimum: new tools.Size({ value: 512, unit: tools.SizeUnit.MB }),
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
