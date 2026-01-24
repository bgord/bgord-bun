import { describe, expect, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const adapter = new ClockSystemAdapter();

describe("ClockSystemAdapter", () => {
  test("now", () => {
    expect(typeof adapter.now().ms).toEqual("number");
  });
});
