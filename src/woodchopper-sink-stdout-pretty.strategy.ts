import type { WoodchopperSinkEntry, WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodChopperSinkStdoutPretty implements WoodchopperSinkStrategy {
  write(entry: WoodchopperSinkEntry): void {
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}
