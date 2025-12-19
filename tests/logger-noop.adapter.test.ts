import { describe, expect, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

describe("LoggerNoopAdapter", () => {
  test("error", () => {
    const logger = new LoggerNoopAdapter();

    expect(() =>
      logger.error({
        component: "publishing",
        operation: "weekly_review_generate",
        message: "Failed",
        error: { name: "InvariantViolationError", message: "limit exceeded" },
      }),
    ).not.toThrow();
  });
});
