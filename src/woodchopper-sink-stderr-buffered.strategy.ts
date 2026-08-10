import { WoodchopperSinkBuffered } from "./woodchopper-sink-buffered.strategy";

export class WoodchopperSinkStderrBuffered extends WoodchopperSinkBuffered {
  protected emit(payload: string): void {
    process.stderr.write(payload);
  }
}
