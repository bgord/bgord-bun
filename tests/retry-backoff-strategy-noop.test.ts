import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffStrategyNoop } from "../src/retry-backoff-strategy-noop";

const backoff = new RetryBackoffStrategyNoop();

describe("RetryBackoffStrategyNoop", () => {
  test("next", () => {
    const result = backoff.next();
    const expected = tools.Duration.Ms(0);

    expect(result.equals(expected)).toEqual(true);
  });
});
