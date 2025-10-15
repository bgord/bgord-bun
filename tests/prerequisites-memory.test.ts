import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteMemory } from "../src/prerequisites/memory";
import * as prereqs from "../src/prerequisites.service";

const maximum = tools.Size.fromMB(2);

describe("prerequisites - memory", () => {
  test("returns success when memory usage is below the maximum", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: tools.Size.fromMB(1).toBytes() }) as any);

    const prerequisite = new PrerequisiteMemory({ maximum, label: "pass-case" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure when memory usage exceeds the maximum", async () => {
    const memoryConsumption = tools.Size.fromMB(3);
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: memoryConsumption.toBytes() }));

    const prerequisite = new PrerequisiteMemory({ maximum, label: "fail-case" });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      }),
    );
  });

  test("undetermined", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: maximum }));

    const prerequisite = new PrerequisiteMemory({ maximum, label: "disabled-case", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
