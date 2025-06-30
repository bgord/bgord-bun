import * as tools from "@bgord/tools";
import * as winston from "winston";
import { z } from "zod/v4";

import { CorrelationIdType } from "./correlation-id.vo";
import { NodeEnvironmentEnum } from "./node-env.vo";
import { PathType } from "./path.vo";

export enum LogLevelEnum {
  /** @public */
  silent = "silent",
  error = "error",
  warn = "warn",
  info = "info",
  http = "http",
  verbose = "verbose",
}
export const LogLevel = z.enum(LogLevelEnum);

type LogTimestampType = number;

type LogAppType = string;

type LogEnvironmentType = NodeEnvironmentEnum;

type LogMessageType = string;

type LogOperationType = string;

type LogMetadataType = Record<string, any>;

type LogCorrelationIdType = CorrelationIdType;

const levels: Record<LogLevelEnum, number> = {
  silent: 0,
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
};

type LogFullType = {
  timestamp: LogTimestampType;
  app: LogAppType;
  environment: LogEnvironmentType;
  level: LogLevelEnum;
  message: LogMessageType;
  operation: LogOperationType;
  method: string;
  url: string;
  client: { ip?: string; userAgent?: string };
  correlationId?: LogCorrelationIdType;
  responseCode?: number;
  durationMs?: number;
  metadata?: LogMetadataType;
};

type LogErrorType = Omit<
  LogFullType,
  "app" | "client" | "environment" | "duration" | "level" | "method" | "responseCode" | "timestamp" | "url"
>;

type LogWarnType = Omit<
  LogFullType,
  "app" | "client" | "environment" | "duration" | "level" | "method" | "responseCode" | "timestamp" | "url"
>;

type LogInfoType = Omit<
  LogFullType,
  "app" | "client" | "environment" | "duration" | "level" | "method" | "responseCode" | "timestamp" | "url"
>;

type LogHttpType = Omit<LogFullType, "app" | "environment" | "timestamp" | "level">;

type LoggerOptionsType = {
  app: LogAppType;
  environment: NodeEnvironmentEnum;
  level?: LogLevelEnum;
  transports?: winston.transport[];
};

export class Logger {
  private readonly instance: winston.Logger;

  private readonly app: LoggerOptionsType["app"];

  private readonly environment: LoggerOptionsType["environment"];

  private readonly level: LoggerOptionsType["level"] = LogLevelEnum.verbose;

  constructor(options: LoggerOptionsType) {
    this.app = options.app;
    this.environment = options.environment;
    this.level = options.level ?? LogLevelEnum.verbose;

    const formats = [
      winston.format.json(),
      this.environment !== NodeEnvironmentEnum.production ? winston.format.prettyPrint() : undefined,
    ].filter(Boolean);

    this.instance = winston.createLogger({
      level: this.level,
      levels,
      defaultMeta: this.getBase(),
      handleExceptions: true,
      handleRejections: true,
      format: winston.format.combine(...(formats as NonNullable<winston.LoggerOptions["format"]>[])),
      transports: [new winston.transports.Console()],
    });

    if (this.environment === NodeEnvironmentEnum.production) {
      this.instance.add(
        new winston.transports.File({
          filename: this.getProductionLogFilePath(),
          maxsize: tools.Size.toBytes({ unit: tools.SizeUnit.MB, value: 100 }),
        }),
      );
    }

    for (const transport of options.transports ?? []) {
      this.instance.add(transport);
    }
  }

  private getBase() {
    return {
      app: this.app,
      environment: this.environment,
      timestamp: Date.now(),
    };
  }

  info(log: LogInfoType) {
    this.instance.info({ level: LogLevelEnum.info, ...log });
  }

  error(log: LogErrorType) {
    this.instance.error({
      level: LogLevelEnum.error,
      ...log,
    });
  }

  warn(log: LogWarnType) {
    this.instance.warn({ level: LogLevelEnum.warn, ...log });
  }

  http(log: LogHttpType) {
    this.instance.http({ level: LogLevelEnum.http, ...log });
  }

  getProductionLogFilePath(): PathType {
    return `/var/log/${this.app}-${this.environment}.log`;
  }

  formatError(_error: unknown) {
    const error = _error as Error;

    return {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    };
  }
}
