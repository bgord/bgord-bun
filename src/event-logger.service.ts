import type { LoggerPort } from "./logger.port";

type Dependencies = { Logger: LoggerPort };

export class EventLogger {
  private readonly base = { component: "infra", operation: "event_emitted" };

  constructor(private readonly deps: Dependencies) {}

  private _handle(
    type: string,
    _debugName: string,
    eventName: string | undefined,
    eventData: Record<string, any> | undefined,
  ) {
    if (type === "subscribe") return;
    if (typeof eventName === "symbol") return;

    this.deps.Logger.info({ message: `${eventName} emitted`, metadata: eventData, ...this.base });
  }

  handle = this._handle.bind(this);
}
