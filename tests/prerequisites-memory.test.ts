import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteMemory } from "../src/prerequisites/memory";
import * as mocks from "./mocks";

const maximum = tools.Size.fromMB(2);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteMemory", () => {
  test("success", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: tools.Size.fromMB(1).toBytes() }));
    const prerequisite = new PrerequisiteMemory({ maximum, label: "memory" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - memory usage exceeds the maximum", async () => {
    const memoryConsumption = tools.Size.fromMB(3);
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: memoryConsumption.toBytes() }));
    const prerequisite = new PrerequisiteMemory({ maximum, label: "memory" });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      }),
    );
  });

  test("undetermined", async () => {
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: maximum }));
    const prerequisite = new PrerequisiteMemory({ maximum, label: "memory", enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
