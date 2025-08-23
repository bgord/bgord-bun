import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";

export class LoggerWinstonLocalAdapter {
  constructor(private readonly app: LogAppType) {}

  create(level: LogLevelEnum): LoggerPort {
    return new LoggerWinstonAdapter({ app: this.app, environment: NodeEnvironmentEnum.local, level });
  }
}
