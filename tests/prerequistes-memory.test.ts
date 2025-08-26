import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteMemory } from "../src/prerequisites/memory";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - memory", () => {
  test("returns failure when memory usage exceeds the maximum", async () => {
    spyOn(process, "memoryUsage").mockImplementation(
      // @ts-expect-error
      () => ({
        rss: new tools.Size({ value: 1, unit: tools.SizeUnit.MB }).toBytes(),
      }),
    );

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 500, unit: tools.SizeUnit.b }),
      label: "fail-case",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns success when memory usage is below the maximum", async () => {
    spyOn(process, "memoryUsage").mockImplementation(
      // @ts-expect-error
      () => ({
        rss: new tools.Size({ value: 1, unit: tools.SizeUnit.MB }).toBytes(),
      }),
    );

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 2, unit: tools.SizeUnit.MB }),
      label: "pass-case",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns undetermined when the check is disabled", async () => {
    spyOn(process, "memoryUsage").mockImplementation(
      // @ts-expect-error
      () => ({
        rss: new tools.Size({ value: 1, unit: tools.SizeUnit.MB }).toBytes(),
      }),
    );

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 500, unit: tools.SizeUnit.b }),
      label: "disabled-case",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
