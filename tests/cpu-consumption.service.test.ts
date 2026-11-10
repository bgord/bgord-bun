import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CpuConsumption } from "../src/cpu-consumption.service";

describe("CpuConsumption", () => {
  test("snapshot", () => {
    using _ = spyOn(process, "cpuUsage").mockReturnValue({ user: 1234567, system: 7654321 });

    const result = CpuConsumption.snapshot();

    expect(result).toEqual({ user: tools.Duration.Ms(1235), system: tools.Duration.Ms(7654) });
  });
});
