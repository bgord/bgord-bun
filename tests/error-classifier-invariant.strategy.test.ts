import { describe, expect, test } from "bun:test";
import { ErrorClassifierInvariantStrategy } from "../src/error-classifier-invariant.strategy";
import { Invariant, InvariantFailureKind } from "../src/invariant.service";

class SampleError extends Error {}

class SampleInvariantFactory extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = SampleError;
  kind = InvariantFailureKind.not_found;
  message = "sample.invariant.failed";
}

const strategy = new ErrorClassifierInvariantStrategy([new SampleInvariantFactory()]);

describe("ErrorClassifierInvariantStrategy", () => {
  test("happy path", async () => {
    const result = strategy.classify(new SampleError("sample.invariant.failed"));

    expect(result?.status).toEqual(404);
    expect(await result?.json()).toEqual({ message: "sample.invariant.failed" });
  });

  test("unknown error", () => {
    expect(strategy.classify(new Error("sample.invariant.failed"))).toEqual(null);
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });
});
