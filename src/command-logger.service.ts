import type { LoggerPort } from "./logger.port";

type Dependencies = { Logger: LoggerPort };

export class CommandLogger {
  private readonly base = { component: "infra", operation: "command_emitted" };

  constructor(private readonly deps: Dependencies) {}

  private _handle(
    type: string,
    _debugName: string,
    commandName: string | undefined,
    commandData: Record<string, any> | undefined,
  ) {
    if (type === "subscribe") return;
    if (typeof commandName === "symbol") return;

    this.deps.Logger.info({ message: `${commandName} emitted`, metadata: commandData, ...this.base });
  }

  handle = this._handle.bind(this);
}
