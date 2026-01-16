import * as tools from "@bgord/tools";
import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorStrategy } from "./redactor.strategy";

type LoggerWinstonProductionAdapterConfigType = { app: LogAppType; redactor: RedactorStrategy };

export class LoggerWinstonProductionAdapter {
  constructor(private readonly config: LoggerWinstonProductionAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    const filePath = tools.FilePathAbsolute.fromString(
      `/var/log/${this.config.app}-${NodeEnvironmentEnum.production}.log`,
    );

    const file = new winston.transports.File({
      filename: filePath.get(),
      maxsize: tools.Size.fromMB(100).toBytes(),
      maxFiles: 3,
      // Stryker disable all
      tailable: true,
      // Stryker restore all
    });

    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.production,
      level,
      // Stryker disable all
      transports: [file],
      // Stryker restore all
      redactor: this.config.redactor,
      filePath,
    });
  }
}
