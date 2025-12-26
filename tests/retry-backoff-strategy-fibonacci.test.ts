import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffStrategyFibonacci } from "../src/retry-backoff-strategy-fibonacci";

const backoff = new RetryBackoffStrategyFibonacci(tools.Duration.Seconds(1));

describe("RetryBackoffStrategyFibonacci", () => {
  test("next", () => {
    expect(backoff.next(0).equals(tools.Duration.Seconds(0))).toEqual(true);
    expect(backoff.next(1).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(2).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(3).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(4).equals(tools.Duration.Seconds(3))).toEqual(true);
    expect(backoff.next(5).equals(tools.Duration.Seconds(5))).toEqual(true);
    expect(backoff.next(6).equals(tools.Duration.Seconds(8))).toEqual(true);
    expect(backoff.next(7).equals(tools.Duration.Seconds(13))).toEqual(true);
    expect(backoff.next(8).equals(tools.Duration.Seconds(21))).toEqual(true);
  });
});
