import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as prereqs from "../src/prerequisites.service";

const minimum = tools.Size.fromMB(512);

describe("PrerequisiteRAM", () => {
  test("success", async () => {
    spyOn(os, "freemem").mockReturnValue(tools.Size.fromMB(513).toBytes());

    expect(await new PrerequisiteRAM({ label: "ram", minimum }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());

    expect(await new PrerequisiteRAM({ label: "ram", minimum }).verify()).toEqual(
      prereqs.Verification.failure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` }),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteRAM({ label: "ram", enabled: false, minimum }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
