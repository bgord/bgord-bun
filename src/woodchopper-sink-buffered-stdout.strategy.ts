import { WoodchopperSinkBuffered } from "./woodchopper-sink-buffered.strategy";

export class WoodchopperSinkBufferedStdout extends WoodchopperSinkBuffered {
  protected emit(payload: string): void {
    process.stdout.write(payload);
  }
}
