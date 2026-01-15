import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../src/memory-consumption.service";

const rss = tools.Size.fromBytes(123456789);
const memoryUsage = { rss: rss.toBytes() } as any;

describe("MemoryConsumption service", () => {
  test("get", () => {
    spyOn(process, "memoryUsage").mockReturnValue(memoryUsage);

    const result = MemoryConsumption.get();

    expect(result.equals(rss)).toEqual(true);
    expect(result.format(tools.Size.unit.MB)).toEqual("117.74 MB");
  });
});
