import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

export type AlertChannelWithLoggerAdapterDependencies = {
  inner: AlertChannelPort;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class AlertChannelWithLoggerAdapter implements AlertChannelPort {
  private readonly base = { component: "infra", operation: "alert_channel" };

  constructor(private readonly deps: AlertChannelWithLoggerAdapterDependencies) {}

  async send(alert: AlertMessage): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Alert channel attempt",
        correlationId: CorrelationStorage.get(),
        metadata: alert.toJSON(),
        ...this.base,
      });

      await this.deps.inner.send(alert);

      this.deps.Logger.info({
        message: "Alert channel success",
        correlationId: CorrelationStorage.get(),
        metadata: { alert: alert.toJSON(), duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Alert channel error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { alert: alert.toJSON(), duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
