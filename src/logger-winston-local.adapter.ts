import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorPort } from "./redactor.port";

type LoggerWinstonLocalAdapterConfigType = { app: LogAppType; redactor: RedactorPort };

export class LoggerWinstonLocalAdapter {
  constructor(private readonly config: LoggerWinstonLocalAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    const coloredConsoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          const {
            level,
            message,
            timestamp,
            [Symbol.for("level")]: _level,
            [Symbol.for("message")]: _message,
            ...rest
          } = info;

          return JSON.stringify({ level, message, ...rest, timestamp }, null, 2);
        }),
      ),
    });

    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.local,
      level,
      redactor: this.config.redactor,
      transports: [coloredConsoleTransport],
      formats: [],
      filePath: null,
    });
  }
}
