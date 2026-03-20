import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RandomnessNoopStrategy } from "../src/randomness-noop.strategy";
import { RetryBackoffJitterStrategy } from "../src/retry-backoff-jitter.strategy";

describe("RetryBackoffJitterStrategy", () => {
  test("next - 1 factor", () => {
    const backoff = new RetryBackoffJitterStrategy(tools.Duration.Seconds(1), new RandomnessNoopStrategy(1));

    expect(backoff.next(tools.Int.positive(1)).equals(tools.Duration.Seconds(1))).toEqual(true);
    expect(backoff.next(tools.Int.positive(2)).equals(tools.Duration.Seconds(2))).toEqual(true);
    expect(backoff.next(tools.Int.positive(3)).equals(tools.Duration.Seconds(3))).toEqual(true);
    expect(backoff.next(tools.Int.positive(4)).equals(tools.Duration.Seconds(4))).toEqual(true);
  });

  test("next - 0.5 factor", () => {
    const backoff = new RetryBackoffJitterStrategy(
      tools.Duration.Seconds(1),
      new RandomnessNoopStrategy(0.5),
    );

    expect(backoff.next(tools.Int.positive(1)).equals(tools.Duration.Ms(500))).toEqual(true);
    expect(backoff.next(tools.Int.positive(2)).equals(tools.Duration.Ms(1000))).toEqual(true);
    expect(backoff.next(tools.Int.positive(3)).equals(tools.Duration.Ms(1500))).toEqual(true);
    expect(backoff.next(tools.Int.positive(4)).equals(tools.Duration.Ms(2000))).toEqual(true);
  });
});
