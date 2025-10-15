import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteMemory } from "../src/prerequisites/memory";
import * as prereqs from "../src/prerequisites.service";

const maximum = tools.Size.fromMB(2);

describe("prerequisites - memory", () => {
  test("success - memory usage is below the maximum", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: tools.Size.fromMB(1).toBytes() }));

    expect(await new PrerequisiteMemory({ maximum, label: "memory" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - memory usage exceeds the maximum", async () => {
    const memoryConsumption = tools.Size.fromMB(3);
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: memoryConsumption.toBytes() }));

    expect(await new PrerequisiteMemory({ maximum, label: "memory" }).verify()).toEqual(
      prereqs.Verification.failure({
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      }),
    );
  });

  test("undetermined", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: maximum }));

    expect(await new PrerequisiteMemory({ maximum, label: "memory", enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
