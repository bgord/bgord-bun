import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteMemory } from "../src/prerequisites/memory";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - memory", () => {
  test("returns success when memory usage is below the maximum", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({
      rss: new tools.Size({ value: 1, unit: tools.SizeUnit.MB }).toBytes(),
    }));

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 2, unit: tools.SizeUnit.MB }),
      label: "pass-case",
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure when memory usage exceeds the maximum", async () => {
    const memoryConsumption = new tools.Size({ value: 1, unit: tools.SizeUnit.MB });
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: memoryConsumption.toBytes() }));

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 500, unit: tools.SizeUnit.b }),
      label: "fail-case",
    });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({
        message: `Memory consumption: ${memoryConsumption.format(tools.SizeUnit.MB)}`,
      }),
    );
  });

  test("returns undetermined when the check is disabled", async () => {
    spyOn(process, "memoryUsage").mockImplementation(
      // @ts-expect-error
      () => ({ rss: new tools.Size({ value: 1, unit: tools.SizeUnit.MB }).toBytes() }),
    );

    const prerequisite = new PrerequisiteMemory({
      maximum: new tools.Size({ value: 500, unit: tools.SizeUnit.b }),
      label: "disabled-case",
      enabled: false,
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
