import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";

import * as prereqs from "../src/prerequisites.service";
import { PrerequisitePath } from "../src/prerequisites/path";
import { PrerequisiteRAM } from "../src/prerequisites/ram";

describe("Prerequisites", () => {
  test("exits the process if at least one prerequisite fails", async () => {
    const consoleLog = spyOn(console, "log").mockImplementation(jest.fn());
    const fspAccess = spyOn(fsp, "access").mockRejectedValue(() => {
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

    await prereqs.Prerequisites.check([ram, path]);

    expect(ram.status).toBe(prereqs.PrerequisiteStatusEnum.success);
    expect(path.status).toBe(prereqs.PrerequisiteStatusEnum.failure);

    expect(processExit).toHaveBeenCalledWith(1);

    processExit.mockRestore();
    fspAccess.mockRestore();
    consoleLog.mockRestore();
  });

  test("does not exit the process if all prerequisites succeed", async () => {
    const consoleLog = spyOn(console, "log").mockImplementation(jest.fn());
    const fspAccess = spyOn(fsp, "access").mockResolvedValue();

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

    await prereqs.Prerequisites.check([ram, path]);

    expect(ram.status).toBe(prereqs.PrerequisiteStatusEnum.success);
    expect(path.status).toBe(prereqs.PrerequisiteStatusEnum.success);

    expect(processExit).not.toHaveBeenCalled();

    processExit.mockRestore();
    fspAccess.mockRestore();
    consoleLog.mockRestore();
  });

  test("handles unexpected exceptions gracefully", async () => {
    type PrerequisiteBrokenConfigType = {
      label: prereqs.PrerequisiteLabelType;
      enabled?: boolean;
    };

    class Broken extends prereqs.AbstractPrerequisite<PrerequisiteBrokenConfigType> {
      readonly strategy = prereqs.PrerequisiteStrategyEnum.custom;

      constructor(readonly config: PrerequisiteBrokenConfigType) {
        super(config);
      }

      async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
        throw new Error("Unexpected failure");
      }
    }

    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});
    const consoleLog = spyOn(console, "log").mockImplementation(jest.fn());

    await prereqs.Prerequisites.check([new Broken({ label: "Broken", enabled: true })]);

    expect(processExit).not.toHaveBeenCalled();

    processExit.mockRestore();
    consoleLog.mockRestore();
  });
});
