import type { SinkEntry, WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodChopperSinkStdout implements WoodchopperSinkStrategy {
  write(entry: SinkEntry): void {
    process.stdout.write(JSON.stringify(entry));
  }
}
