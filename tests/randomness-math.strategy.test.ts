import { describe, expect, test } from "bun:test";
import { RandomnessMathStrategy } from "../src/randomness-math.strategy";

const strategy = new RandomnessMathStrategy();

describe("RandomnessMathStrategy", () => {
  test("next", () => {
    const result = strategy.next();

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });
});
