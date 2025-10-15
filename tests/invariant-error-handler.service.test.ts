import { describe, expect, test } from "bun:test";
import { type ErrorHandler as ErrorHandlerType, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Invariant } from "../src/invariant.service";
import { InvariantErrorHandler } from "../src/invariant-error-handler.service";

class SampleInvariantError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, SampleInvariantError.prototype);
  }
}

class SampleInvariantFactory extends Invariant<{ threshold: number }> {
  fails(config: { threshold: number }) {
    return config.threshold > 10;
  }
  error = SampleInvariantError;
  message = "sample.invariant.failed";
  code = 400 as ContentfulStatusCode;
}

const SampleInvariant = new SampleInvariantFactory();

export class ErrorHandler {
  static handle: ErrorHandlerType = async (error, c) => {
    const invariantErrorHandler = new InvariantErrorHandler([SampleInvariant]).detect(error);

    if (invariantErrorHandler.error) {
      return c.json(...InvariantErrorHandler.respond(invariantErrorHandler.error));
    }

    return c.json({ message: "general.unknown" }, 400);
  };
}

describe("InvariantErrorHandler service", () => {
  test("throws formatted error", async () => {
    const app = new Hono()
      .post("/ping", async (c) => {
        SampleInvariant.perform({ threshold: 15 });
        return c.text("OK");
      })
      .onError(ErrorHandler.handle);

    const result = await app.request("/ping", { method: "post" });
    const json = await result.json();

    expect(result.status).toEqual(SampleInvariant.code);
    expect(json).toEqual({ message: SampleInvariant.message, _known: true });
  });
});
