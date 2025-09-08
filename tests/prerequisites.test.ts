import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteDirectory } from "../src/prerequisites/directory";
import { PrerequisiteRAM } from "../src/prerequisites/ram";
import * as prereqs from "../src/prerequisites.service";

describe("Prerequisites", () => {
  test("exits the process if at least one prerequisite fails", async () => {
    spyOn(console, "log").mockImplementation(jest.fn());
    spyOn(fsp, "access").mockRejectedValue(new Error("Access denied"));

    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});

    const ram = new PrerequisiteRAM({
      label: "RAM",
      minimum: new tools.Size({ value: 100_000, unit: tools.SizeUnit.b }),
    });

    const directory = new PrerequisiteDirectory({
      label: "Writable Dir",
      directory: tools.DirectoryPathAbsoluteSchema.parse("/fake/path"),
      access: { write: true },
    });

    await prereqs.Prerequisites.check([ram, directory]);

    expect(ram.status).toBe(prereqs.PrerequisiteStatusEnum.success);
    expect(directory.status).toBe(prereqs.PrerequisiteStatusEnum.failure);

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

    const directory = new PrerequisiteDirectory({
      label: "Writable Dir",
      directory: tools.DirectoryPathAbsoluteSchema.parse("/tmp"),
      access: { write: true },
    });

    await prereqs.Prerequisites.check([ram, directory]);

    expect(ram.status).toBe(prereqs.PrerequisiteStatusEnum.success);
    expect(directory.status).toBe(prereqs.PrerequisiteStatusEnum.success);

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
