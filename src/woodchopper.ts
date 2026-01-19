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
import { WoodchopperStats } from "./woodchopper-stats.service";

type WoodchopperDiagnosticKind = "normalization" | "injection" | "redaction" | "sink" | "clock";

type WoodchopperDiagnostic = { kind: WoodchopperDiagnosticKind; error: unknown };

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
  sink: WoodchopperSinkStrategy;
  redactor?: RedactorStrategy;
  onDiagnostic?: (diagnostic: WoodchopperDiagnostic) => void;
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

export enum WoodchopperState {
  open = "open",
  closed = "closed",
}

export class Woodchopper implements LoggerPort {
  private state: WoodchopperState;
  private readonly stats: WoodchopperStats;

  constructor(
    private readonly config: WoodchopperConfigType,
    private readonly deps: Dependencies,
    stats?: WoodchopperStats,
  ) {
    this.state = WoodchopperState.open;
    this.stats = stats ?? new WoodchopperStats();
  }

  private log(
    level: LogLevelEnum,
    entry: Omit<LogCoreType | LogHttpType | LogWarnType | LogErrorType, AdapterInjectedFields>,
  ) {
    if (this.state === WoodchopperState.closed) return;
    if (LOG_LEVEL_PRIORITY[level] > LOG_LEVEL_PRIORITY[this.config.level]) return;

    const withNormalization =
      "error" in entry && entry.error !== undefined ? { ...entry, error: formatError(entry.error) } : entry;

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

    this.config.sink.write(Object.freeze(withRedaction));
    this.stats.recordWritten();
  }

  error: LoggerPort["error"] = (entry) => this.log(LogLevelEnum.error, entry);
  warn: LoggerPort["warn"] = (entry) => this.log(LogLevelEnum.warn, entry);
  info: LoggerPort["info"] = (entry) => this.log(LogLevelEnum.info, entry);
  http: LoggerPort["http"] = (entry) => this.log(LogLevelEnum.http, entry);
  verbose: LoggerPort["verbose"] = (entry) => this.log(LogLevelEnum.verbose, entry);
  debug: LoggerPort["debug"] = (entry) => this.log(LogLevelEnum.debug, entry);
  silly: LoggerPort["silly"] = (entry) => this.log(LogLevelEnum.silly, entry);

  close() {
    this.state = WoodchopperState.closed;
  }

  getStats() {
    return { ...this.stats.snapshot, state: this.state };
  }
}
