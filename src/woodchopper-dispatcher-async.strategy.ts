import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperDispatcherAsync implements WoodchopperDispatcher {
  onError?: (error: unknown) => void;

  private readonly buffer: LoggerEntry[] = [];
  private running = true;

  private wake?: () => void;

  constructor(
    private readonly sink: WoodchopperSinkStrategy,
    private readonly capacity: number = 256,
  ) {
    this.run();
  }

  dispatch(entry: LoggerEntry): boolean {
    if (!this.running) return false;
    if (this.buffer.length >= this.capacity) return false;

    this.buffer.push(entry);

    this.wakeConsumer();

    return true;
  }

  close(): void {
    this.running = false;
    this.buffer.length = 0;

    // wake so the loop can exit immediately
    this.wakeConsumer();
  }

  private async run(): Promise<void> {
    while (this.running) {
      if (this.buffer.length === 0) {
        await new Promise<void>((resolve) => {
          this.wake = resolve;
        });
        continue;
      }

      const entry = this.buffer.shift()!;
      try {
        this.sink.write(entry);
      } catch (error) {
        this.onError?.(error);
      }
    }
  }

  private async wakeConsumer() {
    this.wake?.();
    this.wake = undefined;
  }
}
