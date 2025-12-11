import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorPort } from "./redactor.port";

type LoggerWinstonLocalAdapterConfigType = { app: LogAppType; redactor: RedactorPort };

export class LoggerWinstonLocalAdapter {
  constructor(private readonly config: LoggerWinstonLocalAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.local,
      level,
      redactor: this.config.redactor,
      formats: [winston.format.prettyPrint()],
      filePath: null,
    });
  }
}
