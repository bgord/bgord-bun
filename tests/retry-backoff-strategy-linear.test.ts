import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffStrategyLinear } from "../src/retry-backoff-strategy-linear";

const backoff = new RetryBackoffStrategyLinear(tools.Duration.Seconds(1));

describe("RetryBackoffStrategyLinear", () => {
  test("next - first attempt", () => {
    const result = backoff.next(1);
    const expected = tools.Duration.Seconds(1);

    expect(result.equals(expected)).toEqual(true);
  });

  test("next - second attempt", () => {
    const result = backoff.next(2);
    const expected = tools.Duration.Seconds(2);

    expect(result.equals(expected)).toEqual(true);
  });

  test("next - third attempt", () => {
    const result = backoff.next(3);
    const expected = tools.Duration.Seconds(3);

    expect(result.equals(expected)).toEqual(true);
  });
});
