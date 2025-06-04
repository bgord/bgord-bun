import { describe, expect, jest, mock, test } from "bun:test";
import * as tools from "@bgord/tools";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteSpace } from "../src/prerequisites/space";

describe("PrerequisiteSpace", () => {
  test("passes when enough space is available", async () => {
    await mock.module("check-disk-space", () => ({
      default: async () => ({
        free: new tools.Size({ value: 100, unit: tools.SizeUnit.MB }).toBytes(),
      }),
    }));

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(space.status).toBe(PrerequisiteStatusEnum.success);

    jest.restoreAllMocks();
  });

  test("fails when not enough space is available", async () => {
    await mock.module("check-disk-space", () => ({
      default: async () => ({
        free: new tools.Size({ value: 10, unit: tools.SizeUnit.MB }).toBytes(),
      }),
    }));

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(space.status).toBe(PrerequisiteStatusEnum.failure);

    jest.restoreAllMocks();
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
