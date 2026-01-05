import { describe, expect, test } from "bun:test";
import { Invariant, InvariantFailureKind } from "../src/invariant.service";

class MockError extends Error {}

class SampleInvariant extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = MockError;
  kind = InvariantFailureKind.precondition;
  message = "SampleInvariant failed";
}

const invariant = new SampleInvariant();

describe("Invariant service", () => {
  test("passes", async () => {
    expect(invariant.passes({ threshold: 15 })).toEqual(false);
    expect(invariant.passes({ threshold: 10 })).toEqual(true);
  });

  test("ensure - success", async () => {
    expect(async () => invariant.enforce({ threshold: 5 })).not.toThrow();
  });

  test("ensure - failure", async () => {
    expect(async () => invariant.enforce({ threshold: 15 })).toThrow(invariant.error);
  });
});
