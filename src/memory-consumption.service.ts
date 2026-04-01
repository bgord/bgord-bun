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
    const { rss, heapUsed, heapTotal } = process.memoryUsage();

    return {
      total: tools.Size.fromBytes(rss),
      heap: { used: tools.Size.fromBytes(heapUsed), total: tools.Size.fromBytes(heapTotal) },
    };
  }
}
