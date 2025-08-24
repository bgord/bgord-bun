import type { LoggerPort } from "./logger.port";

export class CommandLogger {
  constructor(private readonly logger: LoggerPort) {}

  private _handle(
    type: string,
    _debugName: string,
    commandName: string | undefined,
    commandData: Record<string, any> | undefined,
  ) {
    if (type === "subscribe") return;

    if (typeof commandName === "symbol") return;

    this.logger.info({
      message: `${commandName} emitted`,
      component: "infra",
      operation: "command_emitted",
      metadata: commandData,
    });
  }

  handle = this._handle.bind(this);
}
