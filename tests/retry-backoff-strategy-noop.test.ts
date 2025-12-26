import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffStrategyNoop } from "../src/retry-backoff-strategy-noop";

const backoff = new RetryBackoffStrategyNoop();

describe("RetryBackoffStrategyNoop", () => {
  test("next", () => {
    expect(backoff.next().equals(tools.Duration.Ms(0))).toEqual(true);
  });
});
