import { describe, expect, test } from "bun:test";
import { ErrorHandler as ErrorHandlerType, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Policy } from "../src/policy.service";
import { PolicyErrorHandler } from "../src/policy-error-handler.service";

class SamplePolicyError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, SamplePolicyError.prototype);
  }
}

class SamplePolicyFactory extends Policy<{ threshold: number }> {
  async fails(config: { threshold: number }) {
    return config.threshold > 10;
  }

  error = SamplePolicyError;

  message = "sample.policy.failed";

  code = 400 as ContentfulStatusCode;
}

const SamplePolicy = new SamplePolicyFactory();

export class ErrorHandler {
  static handle: ErrorHandlerType = async (error, c) => {
    const policyErrorHandler = new PolicyErrorHandler([SamplePolicy]).detect(error);

    if (policyErrorHandler.error) {
      return c.json(...PolicyErrorHandler.respond(policyErrorHandler.error));
    }

    return c.json({ message: "general.unknown" }, 400);
  };
}

describe("PolicyErrorHandler", () => {
  test("throws formatted error", async () => {
    const app = new Hono();
    app.post("/ping", async (c) => {
      console.log({ before: "before" });
      await SamplePolicy.perform({ threshold: 15 });
      console.log({ after: "after" });
      return c.text("OK");
    });
    app.onError(ErrorHandler.handle);

    const result = await app.request("/ping", { method: "post" });
    const json = await result.json();

    expect(result.status).toEqual(SamplePolicy.code);
    expect(json).toEqual({ message: SamplePolicy.message, _known: true });
  });
});
