import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as checkDiskSpace from "check-disk-space";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - space", () => {
  test("passes when enough space is available", async () => {
    spyOn(checkDiskSpace, "default").mockResolvedValue({
      diskPath: "",
      size: 0,
      free: new tools.Size({ value: 100, unit: tools.SizeUnit.MB }).toBytes(),
    });

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    expect(result).toEqual(prereqs.Verification.success());
  });

  test("fails when not enough space is available", async () => {
    const free = new tools.Size({ value: 10, unit: tools.SizeUnit.MB });
    spyOn(checkDiskSpace, "default").mockResolvedValue({ diskPath: "", size: 0, free: free.toBytes() });

    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 50, unit: tools.SizeUnit.MB }),
    });

    const result = await space.verify();

    // @ts-expect-error
    expect(result.error.message).toMatch(`Free disk space: ${free.format(tools.SizeUnit.MB)}`);
  });

  test("returns undetermined if disabled", async () => {
    const space = new PrerequisiteSpace({
      label: "Disk",
      minimum: new tools.Size({ value: 1, unit: tools.SizeUnit.b }),
      enabled: false,
    });

    const result = await space.verify();

    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
