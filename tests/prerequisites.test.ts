import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisitePath } from "../src/prerequisites/path";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as prereqs from "../src/prerequisites.service";

describe("Prerequisites", () => {
  test("exits the process if at least one prerequisite fails", async () => {
    spyOn(console, "log").mockImplementation(jest.fn());
    spyOn(fsp, "access").mockRejectedValue(() => {
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
  });

  test("does not exit the process if all prerequisites succeed", async () => {
    spyOn(console, "log").mockImplementation(jest.fn());
    spyOn(fsp, "access").mockResolvedValue();

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
    spyOn(console, "log").mockImplementation(jest.fn());

    await prereqs.Prerequisites.check([new Broken({ label: "Broken", enabled: true })]);

    expect(processExit).not.toHaveBeenCalled();
  });
});
