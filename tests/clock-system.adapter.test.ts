import { describe, expect, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const provider = new ClockSystemAdapter();

describe("ClockSystemAdapter", () => {
  test("nowMs", () => {
    expect(typeof provider.nowMs()).toEqual("number");
  });

  test("now", () => {
    expect(provider.now()).toBeDefined();
  });
});
