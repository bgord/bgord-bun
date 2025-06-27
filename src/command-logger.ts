import { Logger } from "./logger.service";

// TODO: add tests
export class CommandLogger {
  constructor(private readonly logger: Logger) {}

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
      operation: "command_emitted",
      metadata: commandData,
    });
  }

  handle = this._handle.bind(this);
}
