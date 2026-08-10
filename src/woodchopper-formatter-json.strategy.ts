import type { LoggerEntry } from "./logger.port";
import type { WoodchopperFormatterStrategy } from "./woodchopper-formatter.strategy";

export class WoodchopperFormatterJson implements WoodchopperFormatterStrategy {
  format(entry: LoggerEntry): string {
    return `${JSON.stringify(entry)}\n`;
  }
}
