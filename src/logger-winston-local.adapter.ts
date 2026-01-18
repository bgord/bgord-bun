import * as winston from "winston";
import type { LoggerAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorStrategy } from "./redactor.strategy";

type LoggerWinstonLocalAdapterConfigType = { app: LoggerAppType; redactor: RedactorStrategy };

export class LoggerWinstonLocalAdapter {
  constructor(private readonly config: LoggerWinstonLocalAdapterConfigType) {}

  // Stryker disable all
  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.local,
      level,
      formats: [winston.format.prettyPrint()],
      redactor: this.config.redactor,
    });
    // Stryker restore all
  }
}
