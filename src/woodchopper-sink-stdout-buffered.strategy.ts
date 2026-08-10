import { WoodchopperSinkBuffered } from "./woodchopper-sink-buffered.strategy";

export class WoodchopperSinkStdoutBuffered extends WoodchopperSinkBuffered {
  protected emit(payload: string): void {
    process.stdout.write(payload);
  }
}
