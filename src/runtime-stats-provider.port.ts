import type * as tools from "@bgord/tools";
import type { CpuConsumptionSnapshotType } from "./cpu-consumption.service";
import type { EventLoopLagSnapshotType } from "./event-loop-lag.service";
import type { MemoryConsumptionSnapshotType } from "./memory-consumption.service";
import type { UptimeResultType } from "./uptime.service";

export type RuntimeStatsSnapshot = {
  uptime: UptimeResultType;
  memory: MemoryConsumptionSnapshotType;
  cpu: { time: CpuConsumptionSnapshotType };
  eventLoop: { lag: EventLoopLagSnapshotType };
  inFlight: tools.IntegerType;
};

export interface RuntimeStatsProviderPort {
  getStats(): RuntimeStatsSnapshot;
}
