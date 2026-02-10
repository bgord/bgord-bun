import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../src/memory-consumption.service";

const rss = tools.Size.fromBytes(123456789);
const heapUsed = tools.Size.fromBytes(234567890);
const heapTotal = tools.Size.fromBytes(345678901);

const memoryUsage = {
  rss: rss.toBytes(),
  heapUsed: heapUsed.toBytes(),
  heapTotal: heapTotal.toBytes(),
  external: 0,
  arrayBuffers: 0,
};

describe("MemoryConsumption service", () => {
  test("get", () => {
    using _ = spyOn(process, "memoryUsage").mockReturnValue(memoryUsage);

    const result = MemoryConsumption.get();

    expect(result.equals(rss)).toEqual(true);
    expect(result.format(tools.Size.unit.MB)).toEqual("117.74 MB");
  });

  test("snapshot", () => {
    using _ = spyOn(process, "memoryUsage").mockReturnValue(memoryUsage);

    const result = MemoryConsumption.snapshot();

    expect(result.total.equals(rss)).toEqual(true);
    expect(result.heap.total.equals(heapTotal)).toEqual(true);
    expect(result.heap.used.equals(heapUsed)).toEqual(true);
  });
});
