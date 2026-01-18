import type { ClockPort } from "./clock.port";
import { type LoggerAppType, type LoggerPort, LogLevelEnum } from "./logger.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
};

type Dependencies = { Clock: ClockPort };

export class Woodchopper implements LoggerPort {
  constructor(
    private readonly config: WoodchopperConfigType,
    private readonly deps: Dependencies,
  ) {}

  private log(level: LogLevelEnum, entry: any) {
    console.log({
      timestamp: new Date(this.deps.Clock.now().ms).toISOString(),
      level: level,
      app: this.config.app,
      environment: this.config.environment,
      ...entry,
    });
  }

  error: LoggerPort["error"] = (entry) => this.log(LogLevelEnum.error, entry);

  warn: LoggerPort["warn"] = (entry) => this.log(LogLevelEnum.warn, entry);

  info: LoggerPort["info"] = (entry) => this.log(LogLevelEnum.info, entry);

  http: LoggerPort["http"] = (entry) => this.log(LogLevelEnum.http, entry);

  verbose: LoggerPort["verbose"] = (entry) => this.log(LogLevelEnum.verbose, entry);

  debug: LoggerPort["debug"] = (entry) => this.log(LogLevelEnum.debug, entry);

  silly: LoggerPort["silly"] = (entry) => this.log(LogLevelEnum.silly, entry);
}
