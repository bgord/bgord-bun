import type { LoggerEntry } from "./logger.port";
import type { WoodchopperFormatterStrategy } from "./woodchopper-formatter.strategy";

export class WoodchopperFormatterHuman implements WoodchopperFormatterStrategy {
  format(entry: LoggerEntry): string {
    return `${JSON.stringify(entry, null, 2)}\n`;
  }
}
