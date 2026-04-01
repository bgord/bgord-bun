import { describe, expect, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const adapter = new ClockSystemAdapter();

describe("ClockSystemAdapter", () => {
  test("now", () => {
    expect(Number.isFinite(adapter.now().ms)).toEqual(true);
  });
});
