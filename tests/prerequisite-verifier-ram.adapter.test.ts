import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierRamAdapter } from "../src/prerequisite-verifier-ram.adapter";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(512);

const prerequisite = new PrerequisiteVerifierRamAdapter({ minimum });

describe("PrerequisiteVerifierRamAdapter", () => {
  test("success", async () => {
    spyOn(os, "freemem").mockReturnValue(tools.Size.fromMB(513).toBytes());

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const freeRAM = tools.Size.fromMB(256);
    spyOn(os, "freemem").mockReturnValue(freeRAM.toBytes());

    const result = await prerequisite.verify();

    expect(result).toEqual(
      mocks.VerificationFailure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` }),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("ram");
  });
});
