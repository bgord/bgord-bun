import { expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteMemory } from "../src/prerequisites/memory";

test("returns failure when memory usage exceeds the maximum", async () => {
  const processMemoryUsage = spyOn(process, "memoryUsage").mockImplementation(
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

  processMemoryUsage.mockRestore();
});

test("returns success when memory usage is below the maximum", async () => {
  const processMemoryUsage = spyOn(process, "memoryUsage").mockImplementation(
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

  processMemoryUsage.mockRestore();
});

test("returns undetermined when the check is disabled", async () => {
  const processMemoryUsage = spyOn(process, "memoryUsage").mockImplementation(
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

  processMemoryUsage.mockRestore();
});
