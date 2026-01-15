import * as tools from "@bgord/tools";

type MemoryConsumptionSnapshotType = { total: tools.Size; heap: { used: tools.Size; total: tools.Size } };

// RSS - resident set size - how much memory this process uses
// Heap total - how much memory is reserved for the JS heap
// Heap used - how much of the reserved memory is actually used for the JS heap

export class MemoryConsumption {
  static get(): tools.Size {
    return tools.Size.fromBytes(process.memoryUsage().rss);
  }

  static snapshot(): MemoryConsumptionSnapshotType {
    return {
      total: tools.Size.fromBytes(process.memoryUsage().rss),
      heap: {
        used: tools.Size.fromBytes(process.memoryUsage().heapUsed),
        total: tools.Size.fromBytes(process.memoryUsage().heapTotal),
      },
    };
  }
}
