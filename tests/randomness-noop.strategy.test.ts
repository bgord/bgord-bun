import { describe, expect, test } from "bun:test";
import { RandomnessNoopStrategy } from "../src/randomness-noop.strategy";

describe("RandomnessNoopStrategy", () => {
  test("next", () => {
    expect(new RandomnessNoopStrategy(1).next()).toEqual(1);
  });
});
