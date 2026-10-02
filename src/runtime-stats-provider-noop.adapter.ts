import * as tools from "@bgord/tools";
import type { RuntimeStatsProviderPort, RuntimeStatsSnapshot } from "./runtime-stats-provider.port";

export class RuntimeStatsProviderNoopAdapter implements RuntimeStatsProviderPort {
  getStats(): RuntimeStatsSnapshot {
    const zero = tools.Duration.Ms(0);
    const empty = tools.Size.fromBytes(0);

    return {
      uptime: { duration: zero, formatted: "0 seconds ago" },
      memory: { total: empty, heap: { used: empty, total: empty } },
      eventLoop: { lag: { p50: zero, p95: zero, p99: zero }, utilization: 0 },
      inFlight: tools.Int.of(0),
    };
  }
}
