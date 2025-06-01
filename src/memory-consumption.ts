import * as tools from "@bgord/tools";

export class MemoryConsumption {
  static get(): tools.Size {
    const memoryConsumption = process.memoryUsage().rss;

    return new tools.Size({ value: memoryConsumption, unit: tools.SizeUnit.b });
  }
}
