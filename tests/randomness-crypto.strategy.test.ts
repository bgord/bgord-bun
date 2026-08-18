import { describe, expect, spyOn, test } from "bun:test";
import { RandomnessCryptoStrategy } from "../src/randomness-crypto.strategy";

const strategy = new RandomnessCryptoStrategy();

describe("RandomnessCryptoStrategy", () => {
  test("next", () => {
    using getRandomValues = spyOn(crypto, "getRandomValues").mockImplementation((array: Uint32Array) => {
      array[0] = 0x80000000;
      return array;
    });

    expect(strategy.next()).toEqual(0.5);
    expect(getRandomValues).toHaveBeenCalled();
  });
});
