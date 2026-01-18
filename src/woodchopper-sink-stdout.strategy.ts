import type { WoodchopperSinkEntry, WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodChopperSinkStdout implements WoodchopperSinkStrategy {
  write(entry: WoodchopperSinkEntry): void {
    process.stdout.write(JSON.stringify(entry));
  }
}
