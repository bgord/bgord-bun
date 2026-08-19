import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RateLimiter } from "../src/rate-limiter.service";

const duration = tools.Duration.Ms(1000);
const currentTimestampMs = tools.Timestamp.fromNumber(0);

describe("RateLimiter", () => {
  test("first invocation", () => {
    expect(new RateLimiter(duration).verify(currentTimestampMs).allowed).toEqual(true);
  });

  test("rejects invocations within the rate limit", () => {
    const rateLimiter = new RateLimiter(duration);

    const first = rateLimiter.verify(currentTimestampMs);

    expect(first.allowed).toEqual(true);

    const second = rateLimiter.verify(currentTimestampMs.add(duration).subtract(tools.Duration.MIN));

    expect(second.allowed).toEqual(false);
    // @ts-expect-error
    expect(second.remaining).toEqual(tools.Duration.MIN);
  });

  test("allows invocations at the limit boundary", () => {
    const rateLimiter = new RateLimiter(duration);

    const first = rateLimiter.verify(currentTimestampMs);

    expect(first.allowed).toEqual(true);

    const second = rateLimiter.verify(currentTimestampMs.add(duration));

    expect(second.allowed).toEqual(true);
  });

  test("rejects invocations around the boundaries", () => {
    const rateLimiter = new RateLimiter(duration);

    const first = rateLimiter.verify(currentTimestampMs);

    expect(first.allowed).toEqual(true);

    const second = rateLimiter.verify(currentTimestampMs.add(duration));

    expect(second.allowed).toEqual(true);

    const third = rateLimiter.verify(currentTimestampMs.add(duration).add(tools.Duration.MIN));

    expect(third.allowed).toEqual(false);

    const fourth = rateLimiter.verify(currentTimestampMs.add(duration).add(tools.Duration.MIN));

    expect(fourth.allowed).toEqual(false);
  });

  test("toJSON - fresh limiter", () => {
    expect(new RateLimiter(duration).toJSON()).toEqual({ lastInvocation: null });
  });

  test("toJSON - after an allowed invocation", () => {
    const rateLimiter = new RateLimiter(duration);

    rateLimiter.verify(tools.Timestamp.fromNumber(1500));

    expect(rateLimiter.toJSON()).toEqual({ lastInvocation: tools.Timestamp.fromNumber(1500).ms });
  });

  test("toJSON - a rejected invocation does not advance the state", () => {
    const rateLimiter = new RateLimiter(duration);

    rateLimiter.verify(tools.Timestamp.fromNumber(1500));

    const rejected = rateLimiter.verify(tools.Timestamp.fromNumber(1600));

    expect(rejected.allowed).toEqual(false);
    expect(rateLimiter.toJSON()).toEqual({ lastInvocation: tools.Timestamp.fromNumber(1500).ms });
  });

  test("toJSON - survives a JSON round trip", () => {
    const rateLimiter = new RateLimiter(duration);

    rateLimiter.verify(tools.Timestamp.fromNumber(1500));

    expect(JSON.parse(JSON.stringify(rateLimiter))).toEqual({ lastInvocation: 1500 });
  });

  test("fromState - null state behaves like a fresh limiter", () => {
    const rateLimiter = RateLimiter.fromState(duration, { lastInvocation: null });

    expect(rateLimiter.verify(currentTimestampMs).allowed).toEqual(true);
  });

  test("fromState - restores the rejection within the rate limit", () => {
    const rateLimiter = RateLimiter.fromState(duration, {
      lastInvocation: tools.Timestamp.fromNumber(1500).ms,
    });

    const result = rateLimiter.verify(tools.Timestamp.fromNumber(1600));

    expect(result.allowed).toEqual(false);
    // @ts-expect-error
    expect(result.remaining).toEqual(tools.Duration.Ms(900));
  });

  test("fromState - restores the allowance past the rate limit", () => {
    const rateLimiter = RateLimiter.fromState(duration, {
      lastInvocation: tools.Timestamp.fromNumber(1500).ms,
    });

    expect(rateLimiter.verify(tools.Timestamp.fromNumber(2500)).allowed).toEqual(true);
  });

  test("fromState - a restored limiter keeps accumulating state", () => {
    const rateLimiter = RateLimiter.fromState(duration, {
      lastInvocation: tools.Timestamp.fromNumber(1500).ms,
    });

    expect(rateLimiter.verify(tools.Timestamp.fromNumber(2500)).allowed).toEqual(true);
    expect(rateLimiter.toJSON()).toEqual({ lastInvocation: tools.Timestamp.fromNumber(2500).ms });
  });

  test("fromState - follows the currently configured duration, not the stored one", () => {
    const rateLimiter = RateLimiter.fromState(tools.Duration.Ms(100), {
      lastInvocation: tools.Timestamp.fromNumber(1500).ms,
    });

    expect(rateLimiter.verify(tools.Timestamp.fromNumber(1600)).allowed).toEqual(true);
  });

  test("fromState - a toJSON round trip preserves the decisions", () => {
    const rateLimiter = new RateLimiter(duration);

    expect(rateLimiter.verify(tools.Timestamp.fromNumber(1500)).allowed).toEqual(true);

    const restored = RateLimiter.fromState(duration, rateLimiter.toJSON());

    expect(restored.verify(tools.Timestamp.fromNumber(1600)).allowed).toEqual(false);
    expect(restored.verify(tools.Timestamp.fromNumber(2500)).allowed).toEqual(true);
  });
});
