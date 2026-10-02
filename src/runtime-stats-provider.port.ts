import type * as tools from "@bgord/tools";
import type { EventLoopLagSnapshotType } from "./event-loop-lag.service";
import type { EventLoopUtilizationSnapshot } from "./event-loop-utilization.service";
import type { MemoryConsumptionSnapshotType } from "./memory-consumption.service";
import type { UptimeResultType } from "./uptime.service";

export type RuntimeStatsSnapshot = {
  uptime: UptimeResultType;
  memory: MemoryConsumptionSnapshotType;
  eventLoop: { lag: EventLoopLagSnapshotType; utilization: EventLoopUtilizationSnapshot };
  inFlight: tools.IntegerType;
};

export interface RuntimeStatsProviderPort {
  getStats(): RuntimeStatsSnapshot;
}
