import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

enum WoodchopperDispatcherAsyncState {
  running = "running",
  closed = "closed",
}

export class WoodchopperDispatcherAsync implements WoodchopperDispatcher {
  onError?: (error: unknown) => void;

  private readonly buffer: LoggerEntry[] = [];
  private state = WoodchopperDispatcherAsyncState.running;

  private wake?: () => void;

  constructor(
    private readonly sink: WoodchopperSinkStrategy,
    private readonly capacity: number = 256,
  ) {
    this.run();
  }

  dispatch(entry: LoggerEntry): boolean {
    if (this.state === WoodchopperDispatcherAsyncState.closed) return false;
    if (this.buffer.length >= this.capacity) return false;

    this.buffer.push(entry);

    this.wakeConsumer();

    return true;
  }

  close(): void {
    if (this.state === WoodchopperDispatcherAsyncState.closed) return;

    this.state = WoodchopperDispatcherAsyncState.closed;
    this.buffer.length = 0;

    // wake so the loop can exit immediately
    this.wakeConsumer();
  }

  private async run(): Promise<void> {
    while (this.state === WoodchopperDispatcherAsyncState.running) {
      if (this.buffer.length === 0) {
        await this.waitForEntry();

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

  private async waitForEntry() {
    await new Promise<void>((resolve) => {
      this.wake = resolve;
    });
  }
}
