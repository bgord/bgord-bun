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
  static handle: ErrorHandlerType = async (error) => {
    const invariantError = InvariantErrorHandler.detect([SampleInvariant], error);

    if (invariantError) {
      const [message, code] = InvariantErrorHandler.respond(invariantError);

      return Response.json(message, { status: code });
    }

    return Response.json({ message: "general.unknown" }, { status: 500 });
  };
}

const SampleInvariant = new SampleInvariantFactory();

describe("InvariantErrorHandler", () => {
  test("hono", async () => {
    const app = new Hono()
      .post("/ping", async () => {
        SampleInvariant.enforce({ threshold: 15 });
        return new Response("OK");
      })
      .onError(ErrorHandler.handle);

    const result = await app.request("/ping", { method: "post" });
    const json = await result.json();

    expect(result.status).toEqual(400);
    expect(json).toEqual({ message: SampleInvariant.message });
  });
});
