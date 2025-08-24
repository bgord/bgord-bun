import type { LoggerPort } from "./logger.port";

export class EventLogger {
  constructor(private readonly logger: LoggerPort) {}

  private _handle(
    type: string,
    _debugName: string,
    eventName: string | undefined,
    eventData: Record<string, any> | undefined,
  ) {
    if (type === "subscribe") return;

    if (typeof eventName === "symbol") return;

    this.logger.info({
      message: `${eventName} emitted`,
      component: "infra'",
      operation: "event_emitted",
      metadata: eventData,
    });
  }

  handle = this._handle.bind(this);
}
