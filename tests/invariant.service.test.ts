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

const invariant = new SampleInvariant();

describe("Invariant service", () => {
  test("failure", async () => {
    expect(invariant.fails({ threshold: 15 })).toEqual(true);
    expect(invariant.fails({ threshold: 10 })).toEqual(false);
  });

  test("failure - error", () => {
    expect(() => invariant.throw()).toThrowError(MockError);
  });

  test("perform - success", async () => {
    expect(async () => invariant.perform({ threshold: 5 })).not.toThrow();
  });

  test("perform - failure", async () => {
    try {
      const invariant = new SampleInvariant();
      invariant.perform({ threshold: 15 });

      expect.unreachable();
    } catch {}
  });

  test("passes", async () => {
    expect(invariant.passes({ threshold: 10 })).toEqual(true);
    expect(invariant.passes({ threshold: 15 })).toEqual(false);
  });
});
