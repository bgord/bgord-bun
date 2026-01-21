import { describe, expect, test } from "bun:test";
import { LoggerState } from "../src/logger-stats-provider.port";
import { LoggerStatsProviderNoopAdapter } from "../src/logger-stats-provider-noop.adapter";

const adapter = new LoggerStatsProviderNoopAdapter();

describe("LoggerStatsProviderNoopAdapter", () => {
  test("getStats", () => {
    expect(adapter.getStats()).toEqual({
      state: LoggerState.open,
      dropped: 0,
      deliveryFailures: 0,
      written: 0,
    });
  });
});
