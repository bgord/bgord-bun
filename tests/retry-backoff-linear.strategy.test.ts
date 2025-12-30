import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffLinearStrategy } from "../src/retry-backoff-linear.strategy";

const backoff = new RetryBackoffLinearStrategy(tools.Duration.Seconds(1));

describe("RetryBackoffLinearStrategy", () => {
  test("next", () => {
    expect(backoff.next(tools.IntegerPositive.parse(1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(2)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(tools.IntegerPositive.parse(3)).equals(tools.Duration.Seconds(3))).toEqual(true);
  });
});
