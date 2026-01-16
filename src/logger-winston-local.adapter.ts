import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import type { RedactorStrategy } from "./redactor.strategy";

type LoggerWinstonLocalAdapterConfigType = { app: LogAppType; redactor: RedactorStrategy };

export class LoggerWinstonLocalAdapter {
  constructor(private readonly config: LoggerWinstonLocalAdapterConfigType) {}

  // Stryker disable all
  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: "local",
      level,
      formats: [winston.format.prettyPrint()],
      redactor: this.config.redactor,
      filePath: null,
    });
    // Stryker restore all
  }
}
