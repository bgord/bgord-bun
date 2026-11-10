import * as tools from "@bgord/tools";

export type CpuConsumptionSnapshotType = { user: tools.Duration; system: tools.Duration };

// User - cumulative CPU time spent in the process code since startup
// System - cumulative CPU time spent in the kernel on behalf of the process since startup

export class CpuConsumption {
  static snapshot(): CpuConsumptionSnapshotType {
    const { user, system } = process.cpuUsage();

    return { user: tools.Duration.Ns(user * 1000), system: tools.Duration.Ns(system * 1000) };
  }
}
