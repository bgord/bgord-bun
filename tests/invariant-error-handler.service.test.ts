import { describe, expect, test } from "bun:test";
import { type ErrorHandler as ErrorHandlerType, Hono } from "hono";
import { Invariant, InvariantFailureKind } from "../src/invariant.service";
import { InvariantErrorHandler } from "../src/invariant-error-handler.service";

class MockError extends Error {}

class SampleInvariantFactory extends Invariant<{ threshold: number }> {
  passes(config: { threshold: number }) {
    return config.threshold <= 10;
  }
  error = MockError;
  kind = InvariantFailureKind.precondition;
  message = "SampleInvariant failed";
}

export class ErrorHandler {
  static handle: ErrorHandlerType = async (error, c) => {
    const invariantError = InvariantErrorHandler.detect([SampleInvariant], error);

    if (invariantError) {
      return c.json(...InvariantErrorHandler.respond(invariantError));
    }

    return c.json({ message: "general.unknown" }, 500);
  };
}

const SampleInvariant = new SampleInvariantFactory();

describe("InvariantErrorHandler service", () => {
  test("happy path", async () => {
    const app = new Hono()
      .post("/ping", async (c) => {
        SampleInvariant.enforce({ threshold: 15 });
        return c.text("OK");
      })
      .onError(ErrorHandler.handle);

    const result = await app.request("/ping", { method: "post" });
    const json = await result.json();

    expect(result.status).toEqual(400);
    expect(json).toEqual({ message: SampleInvariant.message, _known: true });
  });
});
