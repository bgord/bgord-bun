import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffFibonacciStrategy } from "../src/retry-backoff-fibonacci.strategy";

const backoff = new RetryBackoffFibonacciStrategy(tools.Duration.Seconds(1));

describe("RetryBackoffFibonacciStrategy", () => {
  test("next", () => {
    expect(backoff.next(tools.IntegerPositive.parse(1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(2)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(3)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(4)).equals(tools.Duration.Seconds(3))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(5)).equals(tools.Duration.Seconds(5))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(6)).equals(tools.Duration.Seconds(8))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(7)).equals(tools.Duration.Seconds(13))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(8)).equals(tools.Duration.Seconds(21))).toEqual(true);
  });
});
