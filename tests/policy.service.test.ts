import { describe, expect, test } from "bun:test";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { Policy } from "../src/policy.service";

class MockError extends Error {}

class SamplePolicy extends Policy<{ threshold: number }> {
  fails(config: { threshold: number }) {
    return config.threshold > 10;
  }

  error = MockError;

  message = "SamplePolicy failed";

  code = 400 as ContentfulStatusCode;
}

describe("Policy class", () => {
  test("fails method correctly determines if a policy fails", async () => {
    const policy = new SamplePolicy();

    const result1 = policy.fails({ threshold: 15 });
    expect(result1).toBe(true);

    const result2 = policy.fails({ threshold: 10 });
    expect(result2).toBe(false);
  });

  test("throw method throws the expected error", () => {
    const policy = new SamplePolicy();

    expect(() => policy.throw()).toThrowError(MockError);
  });

  test("perform method throws error when policy fails", async () => {
    try {
      const policy = new SamplePolicy();
      policy.perform({ threshold: 15 });
      expect.unreachable();
    } catch (_error) {}
  });

  test("perform method does not throw error when policy passes", async () => {
    const policy = new SamplePolicy();

    expect(async () => policy.perform({ threshold: 5 })).not.toThrow();
  });

  test("passes method correctly determines if a policy passes", async () => {
    const policy = new SamplePolicy();

    // Policy should pass when threshold is less than or equal to 10
    const result1 = policy.passes({ threshold: 10 });
    expect(result1).toBe(true);

    // Policy should fail when threshold is greater than 10
    const result2 = policy.passes({ threshold: 15 });
    expect(result2).toBe(false);
  });
});
