import { describe, expect, test } from "bun:test";
import { ClockSystemAdapter } from "../src/clock-system.adapter";

const provider = new ClockSystemAdapter();

describe("ClockSystemAdapter", () => {
  test("works", () => {
    expect(provider.now()).toBeNumber();
  });
});
