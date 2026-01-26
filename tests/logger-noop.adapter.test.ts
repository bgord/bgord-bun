import { describe, expect, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { LoggerState } from "../src/logger-stats-provider.port";

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

  test("getStats", () => {
    expect(adapter.getStats()).toEqual({
      written: 0,
      dropped: 0,
      deliveryFailures: 0,
      state: LoggerState.open,
    });
  });
});
