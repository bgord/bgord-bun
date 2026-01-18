import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorStrategy } from "./redactor.strategy";

type LoggerWinstonProductionAdapterConfigType = { app: LogAppType; redactor: RedactorStrategy };

export class LoggerWinstonProductionAdapter {
  constructor(private readonly config: LoggerWinstonProductionAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.production,
      level,
      redactor: this.config.redactor,
    });
  }
}
