import type { ClockPort } from "./clock.port";
import { formatError } from "./format-error.service";
import {
  type AdapterInjectedFields,
  type LogCoreType,
  type LogErrorType,
  type LoggerAppType,
  type LoggerPort,
  type LogHttpType,
  LogLevelEnum,
  type LogWarnType,
} from "./logger.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorStrategy } from "./redactor.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
  sink: WoodchopperSinkStrategy;
  redactor?: RedactorStrategy;
};

type Dependencies = { Clock: ClockPort };

const LOG_LEVEL_PRIORITY: Record<LogLevelEnum, number> = {
  [LogLevelEnum.error]: 0,
  [LogLevelEnum.warn]: 1,
  [LogLevelEnum.info]: 2,
  [LogLevelEnum.http]: 3,
  [LogLevelEnum.verbose]: 4,
  [LogLevelEnum.debug]: 5,
  [LogLevelEnum.silly]: 6,
};

export class Woodchopper implements LoggerPort {
  constructor(
    private readonly config: WoodchopperConfigType,
    private readonly deps: Dependencies,
  ) {}

  private log(
    level: LogLevelEnum,
    entry: Omit<LogCoreType | LogHttpType | LogWarnType | LogErrorType, AdapterInjectedFields>,
  ) {
    if (LOG_LEVEL_PRIORITY[level] > LOG_LEVEL_PRIORITY[this.config.level]) return;

    const withNormalization =
      "error" in entry && entry.error ? { ...entry, error: formatError(entry.error) } : entry;

    const withInjectedFields = {
      timestamp: new Date(this.deps.Clock.now().ms).toISOString(),
      level: level,
      app: this.config.app,
      environment: this.config.environment,
      ...withNormalization,
    };

    const withRedaction = this.config.redactor
      ? this.config.redactor.redact(withInjectedFields)
      : withInjectedFields;

    this.config.sink.write(withRedaction);
  }

  error: LoggerPort["error"] = (entry) => this.log(LogLevelEnum.error, entry);
  warn: LoggerPort["warn"] = (entry) => this.log(LogLevelEnum.warn, entry);
  info: LoggerPort["info"] = (entry) => this.log(LogLevelEnum.info, entry);
  http: LoggerPort["http"] = (entry) => this.log(LogLevelEnum.http, entry);
  verbose: LoggerPort["verbose"] = (entry) => this.log(LogLevelEnum.verbose, entry);
  debug: LoggerPort["debug"] = (entry) => this.log(LogLevelEnum.debug, entry);
  silly: LoggerPort["silly"] = (entry) => this.log(LogLevelEnum.silly, entry);
}
