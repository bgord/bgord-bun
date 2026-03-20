import { describe, expect, test } from "bun:test";
import { RandomnessCryptoStrategy } from "../src/randomness-crypto.strategy";

const strategy = new RandomnessCryptoStrategy();

describe("RandomnessCryptoStrategy", () => {
  test("next", () => {
    const result = strategy.next();

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
