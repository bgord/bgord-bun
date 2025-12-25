import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierRamAdapter } from "../src/prerequisite-verifier-ram.adapter";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(512);

describe("PrerequisiteVerifierRamAdapter", () => {
  test("success", async () => {
    spyOn(os, "freemem").mockReturnValue(tools.Size.fromMB(513).toBytes());
    const prerequisite = new PrerequisiteVerifierRamAdapter({ label: "ram", minimum });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());
    const prerequisite = new PrerequisiteVerifierRamAdapter({ label: "ram", minimum });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` }),
    );
  });
});
