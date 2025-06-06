import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as checkDiskSpace from "check-disk-space";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteSpace } from "../src/prerequisites/space";

describe("PrerequisiteSpace", () => {
  test("passes when enough space is available", async () => {
    const checkDiskSpaceDefault = spyOn(checkDiskSpace, "default").mockResolvedValue({
      diskPath: "",
      size: 0,
      free: new tools.Size({ value: 100, unit: tools.SizeUnit.MB }).toBytes(),
    });

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(space.status).toBe(PrerequisiteStatusEnum.success);

    checkDiskSpaceDefault.mockRestore();
  });

  test("fails when not enough space is available", async () => {
    const checkDiskSpaceDefault = spyOn(checkDiskSpace, "default").mockResolvedValue({
      diskPath: "",
      size: 0,
      free: new tools.Size({ value: 10, unit: tools.SizeUnit.MB }).toBytes(),
    });

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(space.status).toBe(PrerequisiteStatusEnum.failure);

    checkDiskSpaceDefault.mockRestore();
  });

  test("returns undetermined if disabled", async () => {
    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 1, unit: tools.SizeUnit.b }),
      enabled: false,
    });

    const result = await space.verify();

    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
    expect(space.status).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
