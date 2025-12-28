import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";

type LoggerWinstonLocalAdapterConfigType = { app: LogAppType };

export class LoggerWinstonLocalAdapter {
  constructor(private readonly config: LoggerWinstonLocalAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.local,
      level,
      formats: [winston.format.prettyPrint()],
      filePath: null,
    });
  }
}
