import type { SinkEntry, WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";

export class WoodchopperSinkNoop implements WoodchopperSinkStrategy {
  readonly entries: SinkEntry[] = [];

  write(entry: SinkEntry): void {
    this.entries.push(entry);
  }
}
