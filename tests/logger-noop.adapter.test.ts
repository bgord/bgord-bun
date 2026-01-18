import { describe, expect, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const adapter = new LoggerNoopAdapter();

describe("LoggerNoopAdapter", () => {
  test("error", () => {
    expect(() =>
      adapter.error({
        component: "publishing",
        operation: "weekly_review_generate",
        message: "Failed",
        error: { name: "InvariantViolationError", message: "limit exceeded" },
      }),
    ).not.toThrow();
  });
});
