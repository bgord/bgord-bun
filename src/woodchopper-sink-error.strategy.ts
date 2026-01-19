import type { WoodchopperSinkEntry, WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";
import { IntentionalError } from "../tests/mocks";

export class WoodchopperSinkError implements WoodchopperSinkStrategy {
  write(_entry: WoodchopperSinkEntry): void {
    throw new Error(IntentionalError);
  }
}
