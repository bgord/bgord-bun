import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RuntimeStatsProviderNoopAdapter } from "../src/runtime-stats-provider-noop.adapter";

const zero = tools.Duration.Ms(0);
const empty = tools.Size.fromBytes(0);
const adapter = new RuntimeStatsProviderNoopAdapter();

describe("RuntimeStatsProviderNoopAdapter", () => {
  test("getStats", () => {
    expect(adapter.getStats()).toEqual({
      uptime: { duration: zero, formatted: "0 seconds ago" },
      memory: { total: empty, heap: { used: empty, total: empty } },
      eventLoop: { lag: { p50: zero, p95: zero, p99: zero }, utilization: 0 },
      inFlight: tools.Int.of(0),
    });
  });
});
