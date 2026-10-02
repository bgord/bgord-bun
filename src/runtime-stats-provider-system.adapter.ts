import type { ClockPort } from "./clock.port";
import { EventLoopLag } from "./event-loop-lag.service";
import { EventLoopUtilization } from "./event-loop-utilization.service";
import { InFlightRequestsTracker } from "./in-flight-requests-tracker.service";
import { MemoryConsumption } from "./memory-consumption.service";
import type { RuntimeStatsProviderPort, RuntimeStatsSnapshot } from "./runtime-stats-provider.port";
import { Uptime } from "./uptime.service";

type Dependencies = { Clock: ClockPort };

export class RuntimeStatsProviderSystemAdapter implements RuntimeStatsProviderPort {
  constructor(private readonly deps: Dependencies) {
    EventLoopLag.start();
  }

  getStats(): RuntimeStatsSnapshot {
    return {
      uptime: Uptime.get(this.deps.Clock),
      memory: MemoryConsumption.snapshot(),
      eventLoop: { lag: EventLoopLag.snapshot(), utilization: EventLoopUtilization.snapshot() },
      inFlight: InFlightRequestsTracker.get(),
    };
  }
}
