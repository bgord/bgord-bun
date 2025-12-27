import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffStrategyLinear } from "../src/retry-backoff-strategy-linear";

const backoff = new RetryBackoffStrategyLinear(tools.Duration.Seconds(1));

describe("RetryBackoffStrategyLinear", () => {
  test("next", () => {
    expect(backoff.next(1).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(2).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(3).equals(tools.Duration.Seconds(3))).toEqual(true);
  });
});
