import { describe, expect, test } from "bun:test";
import { ErrorClassifierInvariantStrategy } from "../src/error-classifier-invariant.strategy";
import { Invariant, InvariantFailureKind } from "../src/invariant.service";

class ForbiddenError extends Error {}
class NotFoundError extends Error {}
class PreconditionError extends Error {}

class ForbiddenInvariantFactory extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = ForbiddenError;
  kind = InvariantFailureKind.forbidden;
  message = "forbidden.invariant.failed";
}

class NotFoundInvariantFactory extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = NotFoundError;
  kind = InvariantFailureKind.not_found;
  message = "not.found.invariant.failed";
}

class PreconditionInvariantFactory extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = PreconditionError;
  kind = InvariantFailureKind.precondition;
  message = "precondition.invariant.failed";
}

const strategy = new ErrorClassifierInvariantStrategy([
  { Forbidden: new ForbiddenInvariantFactory() },
  { NotFound: new NotFoundInvariantFactory(), Precondition: new PreconditionInvariantFactory() },
]);

describe("ErrorClassifierInvariantStrategy", () => {
  test("forbidden", async () => {
    const result = strategy.classify(new ForbiddenError("whatever"));

    expect(result?.status).toEqual(403);
    expect(await result?.json()).toEqual({ message: "forbidden.invariant.failed" });
  });

  test("not_found", async () => {
    const result = strategy.classify(new NotFoundError("whatever"));

    expect(result?.status).toEqual(404);
    expect(await result?.json()).toEqual({ message: "not.found.invariant.failed" });
  });

  test("precondition", async () => {
    const result = strategy.classify(new PreconditionError("whatever"));

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "precondition.invariant.failed" });
  });

  test("unknown error", () => {
    expect(strategy.classify(new Error("whatever"))).toEqual(null);
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });

  test("no modules", () => {
    expect(new ErrorClassifierInvariantStrategy([]).classify(new NotFoundError("whatever"))).toEqual(null);
  });

  test("empty module", () => {
    expect(new ErrorClassifierInvariantStrategy([{}]).classify(new NotFoundError("whatever"))).toEqual(null);
  });
});
