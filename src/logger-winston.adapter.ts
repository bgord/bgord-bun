import type * as tools from "@bgord/tools";
import * as winston from "winston";
import { type LogAppType, type LoggerPort, LogLevelEnum } from "./logger.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";

type WinstonLoggerOptions = {
  app: LogAppType;
  environment: NodeEnvironmentEnum;
  level: LogLevelEnum;
  formats?: winston.Logform.Format[];
  transports?: winston.transport[];
  filePath: tools.FilePathAbsolute | null;
};

export class LoggerWinstonAdapter implements LoggerPort {
  private readonly logger: winston.Logger;

  private readonly filePath: tools.FilePathAbsolute | null;

  constructor(options: WinstonLoggerOptions) {
    const format = winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json(),
      ...(options.formats ?? []),
    );

    this.logger = winston.createLogger({
      levels: winston.config.npm.levels,
      level: options.level,
      defaultMeta: { app: options.app, environment: options.environment },
      handleExceptions: true,
      handleRejections: true,
      format,
      transports: [new winston.transports.Console(), ...(options.transports ?? [])],
    });

    this.filePath = options.filePath;
  }

  warn: LoggerPort["warn"] = (log) => this.logger.log({ level: LogLevelEnum.warn, ...log });
  error: LoggerPort["error"] = (log) => this.logger.log({ level: LogLevelEnum.error, ...log });
  info: LoggerPort["info"] = (log) => this.logger.log({ level: LogLevelEnum.info, ...log });
  http: LoggerPort["http"] = (log) => this.logger.log({ level: LogLevelEnum.http, ...log });
  verbose: LoggerPort["verbose"] = (log) => this.logger.log({ level: LogLevelEnum.verbose, ...log });
  debug: LoggerPort["debug"] = (log) => this.logger.log({ level: LogLevelEnum.debug, ...log });
  silly: LoggerPort["silly"] = (log) => this.logger.log({ level: LogLevelEnum.silly, ...log });

  setSilent: LoggerPort["setSilent"] = (silent) => {
    this.logger.silent = silent;
  };

  getFilePath() {
    return this.filePath;
  }
}
