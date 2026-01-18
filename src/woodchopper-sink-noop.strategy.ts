import type { WoodchopperSinkEntry, WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";

export class WoodchopperSinkNoop implements WoodchopperSinkStrategy {
  readonly entries: WoodchopperSinkEntry[] = [];

  write(entry: WoodchopperSinkEntry): void {
    this.entries.push(entry);
  }
}
