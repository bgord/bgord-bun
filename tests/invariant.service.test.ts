import { describe, expect, test } from "bun:test";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Invariant } from "../src/invariant.service";

class MockError extends Error {}

class SampleInvariant extends Invariant<{ threshold: number }> {
  fails(config: { threshold: number }) {
    return config.threshold > 10;
  }

  error = MockError;

  message = "SampleInvariant failed";

  code = 400 as ContentfulStatusCode;
}

describe("Invariant class", () => {
  test("fails method correctly determines if a invariant fails", async () => {
    const invariant = new SampleInvariant();

    const result1 = invariant.fails({ threshold: 15 });
    expect(result1).toEqual(true);

    const result2 = invariant.fails({ threshold: 10 });
    expect(result2).toEqual(false);
  });

  test("throw method throws the expected error", () => {
    const invariant = new SampleInvariant();

    expect(() => invariant.throw()).toThrowError(MockError);
  });

  test("perform method throws error when invariant fails", async () => {
    try {
      const invariant = new SampleInvariant();
      invariant.perform({ threshold: 15 });
      expect.unreachable();
    } catch {}
  });

  test("perform method does not throw error when invariant passes", async () => {
    const invariant = new SampleInvariant();

    expect(async () => invariant.perform({ threshold: 5 })).not.toThrow();
  });

  test("passes method correctly determines if a invariant passes", async () => {
    const invariant = new SampleInvariant();

    // Invariant should pass when threshold is less than or equal to 10
    const result1 = invariant.passes({ threshold: 10 });
    expect(result1).toEqual(true);

    // Invariant should fail when threshold is greater than 10
    const result2 = invariant.passes({ threshold: 15 });
    expect(result2).toEqual(false);
  });
});
