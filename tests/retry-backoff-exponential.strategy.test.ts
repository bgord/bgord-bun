import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";

const backoff = new RetryBackoffExponentialStrategy(tools.Duration.Seconds(1));

describe("RetryBackoffExponentialStrategy", () => {
  test("next", () => {
    expect(backoff.next(tools.Int.positive(1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(tools.Int.positive(2)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(tools.Int.positive(3)).equals(tools.Duration.Seconds(4))).toEqual(true);
    expect(backoff.next(tools.Int.positive(4)).equals(tools.Duration.Seconds(8))).toEqual(true);
    expect(backoff.next(tools.Int.positive(5)).equals(tools.Duration.Seconds(16))).toEqual(true);
    expect(backoff.next(tools.Int.positive(6)).equals(tools.Duration.Seconds(32))).toEqual(true);
    expect(backoff.next(tools.Int.positive(7)).equals(tools.Duration.Seconds(64))).toEqual(true);
    expect(backoff.next(tools.Int.positive(8)).equals(tools.Duration.Seconds(128))).toEqual(true);
  });
});
