import * as tools from "@bgord/tools";

export class MemoryConsumption {
  static get(): tools.Size {
    return tools.Size.fromBytes(process.memoryUsage().rss);
  }
}
