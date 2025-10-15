import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../src/memory-consumption.service";

describe("Memory consumption", () => {
  test("get", () => {
    const fakeRss = 123456789;
    // @ts-expect-error
    spyOn(process, "memoryUsage").mockImplementation(() => ({ rss: fakeRss }));

    const result = MemoryConsumption.get();

    // @ts-expect-error
    expect(result.toBytes()).toEqual(fakeRss);
    expect(result.format(tools.Size.unit.MB)).toEqual("117.74 MB");
  });
});
