import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";

const backoff = new RetryBackoffExponentialStrategy(tools.Duration.Seconds(1));

describe("RetryBackoffExponentialStrategy", () => {
  test("next", () => {
    expect(backoff.next(v.parse(tools.IntegerPositive, 1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 2)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 3)).equals(tools.Duration.Seconds(4))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 4)).equals(tools.Duration.Seconds(8))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 5)).equals(tools.Duration.Seconds(16))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 6)).equals(tools.Duration.Seconds(32))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 7)).equals(tools.Duration.Seconds(64))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 8)).equals(tools.Duration.Seconds(128))).toEqual(true);
  });
});
