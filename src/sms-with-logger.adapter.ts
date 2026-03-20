import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import type { SmsPort } from "./sms.port";
import { Stopwatch } from "./stopwatch.service";

export type SmsWithLoggerAdapterDependencies = { inner: SmsPort; Logger: LoggerPort; Clock: ClockPort };

export class SmsWithLoggerAdapter implements SmsPort {
  private readonly base = { component: "infra", operation: "sms" };

  constructor(private readonly deps: SmsWithLoggerAdapterDependencies) {}

  async send(message: tools.SmsMessage): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({ message: "SMS attempt", metadata: message.toJSON(), ...this.base });

      await this.deps.inner.send(message);

      this.deps.Logger.info({
        message: "SMS success",
        metadata: { message: message.toJSON(), duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({ message: "SMS error", error, metadata: duration.stop(), ...this.base });

      throw error;
    }
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
