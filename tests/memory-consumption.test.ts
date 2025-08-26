import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../src/memory-consumption.service";

describe("Memory consumption", () => {
  test("MemoryConsumption.get returns current RSS memory as Size", () => {
    const fakeRss = 123456789;

    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: fakeRss }));

    const result = MemoryConsumption.get();

    expect(result).toBeInstanceOf(tools.Size);
    // @ts-expect-error
    expect(result.toBytes()).toBe(fakeRss);
    expect(result.format(tools.SizeUnit.MB)).toBe("117.74 MB");
  });
});
