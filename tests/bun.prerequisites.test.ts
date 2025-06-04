import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStrategyEnum,
  Prerequisites,
} from "../src/prerequisites";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisitePath } from "../src/prerequisites/path";
import { PrerequisiteRAM } from "../src/prerequisites/ram";

beforeEach(() => {
  console.log = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

describe("Prerequisites.check", () => {
  test("exits the process if at least one prerequisite fails", async () => {
    const accessSpy = spyOn(fsp, "access").mockRejectedValue(() => {
      throw new Error("Access denied");
    });

    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});

    const ram = new PrerequisiteRAM({
      label: "RAM",
      minimum: new tools.Size({ value: 100_000, unit: tools.SizeUnit.b }),
    });

    const path = new PrerequisitePath({
      label: "Writable Dir",
      path: "/fake/path",
      access: { write: true },
    });

    await Prerequisites.check([ram, path]);

    expect(ram.status).toBe(PrerequisiteStatusEnum.success);
    expect(path.status).toBe(PrerequisiteStatusEnum.failure);

    expect(processExit).toHaveBeenCalledWith(1);

    processExit.mockRestore();
    accessSpy.mockRestore();
  });

  test("does not exit the process if all prerequisites succeed", async () => {
    const accessSpy = spyOn(fsp, "access").mockResolvedValue();

    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});

    const ram = new PrerequisiteRAM({
      label: "RAM",
      minimum: new tools.Size({ value: 100_000, unit: tools.SizeUnit.b }),
    });

    const path = new PrerequisitePath({
      label: "Writable Dir",
      path: "/tmp",
      access: { write: true },
    });

    await Prerequisites.check([ram, path]);

    expect(ram.status).toBe(PrerequisiteStatusEnum.success);
    expect(path.status).toBe(PrerequisiteStatusEnum.success);

    expect(processExit).not.toHaveBeenCalled();

    processExit.mockRestore();
    accessSpy.mockRestore();
  });

  test("handles unexpected exceptions gracefully", async () => {
    type PrerequisiteBrokenConfigType = {
      label: PrerequisiteLabelType;
      enabled?: boolean;
    };

    class Broken extends AbstractPrerequisite<PrerequisiteBrokenConfigType> {
      readonly strategy = PrerequisiteStrategyEnum.custom;

      constructor(readonly config: PrerequisiteBrokenConfigType) {
        super(config);
      }

      async verify(): Promise<PrerequisiteStatusEnum> {
        throw new Error("Unexpected failure");
      }
    }

    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});

    await Prerequisites.check([new Broken({ label: "Broken", enabled: true })]);

    expect(processExit).not.toHaveBeenCalled();

    processExit.mockRestore();
  });
});
