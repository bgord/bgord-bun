import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { RetryBackoffLinearStrategy } from "../src/retry-backoff-linear.strategy";

const backoff = new RetryBackoffLinearStrategy(tools.Duration.Seconds(1));

describe("RetryBackoffLinearStrategy", () => {
  test("next", () => {
    expect(backoff.next(v.parse(tools.IntegerPositive, 1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 2)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(v.parse(tools.IntegerPositive, 3)).equals(tools.Duration.Seconds(3))).toEqual(true);
  });
});
