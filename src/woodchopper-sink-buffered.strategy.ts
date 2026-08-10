import * as tools from "@bgord/tools";
import type { LoggerEntry } from "./logger.port";
import type { WoodchopperFormatterStrategy } from "./woodchopper-formatter.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

/**
 * Batches formatted entries into a single write, which amortizes the syscall - the dominant
 * cost of writing logs out.
 *
 * Nothing is ever held past the current event loop turn, so a burst of logs costs one write
 * while a lone log still reaches its destination immediately. The cap bounds memory when a
 * synchronous loop never yields.
 *
 * Subclasses supply the destination and nothing else.
 */
export abstract class WoodchopperSinkBuffered implements WoodchopperSinkStrategy {
  private readonly buffer: Array<string> = [];
  private scheduled?: ReturnType<typeof setImmediate>;

  constructor(
    private readonly formatter: WoodchopperFormatterStrategy,
    private readonly cap: tools.IntegerPositiveType = tools.Int.positive(256),
  ) {}

  protected abstract emit(payload: string): void;

  write(entry: LoggerEntry): void {
    this.buffer.push(this.formatter.format(entry));

    if (this.buffer.length >= this.cap) {
      this.flush();
      return;
    }
    if (this.scheduled) return;

    this.scheduled = setImmediate(() => {
      this.scheduled = undefined;
      this.flush();
    });
  }

  close(): void {
    if (this.scheduled) clearImmediate(this.scheduled);
    this.scheduled = undefined;

    this.flush();
  }

  private flush(): void {
    if (this.buffer.length === 0) return;

    const payload = this.buffer.join("");
    this.buffer.length = 0;

    this.emit(payload);
  }
}
