import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { ErrorNormalizer } from "./error-normalizer.service";
import {
  type LoggerAppType,
  type LoggerEntry,
  type LoggerEntryBare,
  type LoggerEntryBareWithError,
  type LoggerPort,
  LogLevelEnum,
} from "./logger.port";
import {
  LoggerState,
  type LoggerStatsProviderPort,
  type LoggerStatsSnapshot,
} from "./logger-stats-provider.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorStrategy } from "./redactor.strategy";
import type { WoodchopperDiagnosticsStrategy } from "./woodchopper-diagnostics.strategy";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import { WoodchopperStats } from "./woodchopper-stats.service";

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
  dispatcher: WoodchopperDispatcher;
  redactor?: RedactorStrategy;
  diagnostics?: WoodchopperDiagnosticsStrategy;
};

type Dependencies = { Clock: ClockPort };

const LOG_LEVEL_PRIORITY: Record<LogLevelEnum, tools.IntegerNonNegativeType> = {
  [LogLevelEnum.error]: tools.IntegerNonNegative.parse(0),
  [LogLevelEnum.warn]: tools.IntegerNonNegative.parse(1),
  [LogLevelEnum.info]: tools.IntegerNonNegative.parse(2),
  [LogLevelEnum.http]: tools.IntegerNonNegative.parse(3),
  [LogLevelEnum.verbose]: tools.IntegerNonNegative.parse(4),
  [LogLevelEnum.debug]: tools.IntegerNonNegative.parse(5),
  [LogLevelEnum.silly]: tools.IntegerNonNegative.parse(6),
};

export class Woodchopper implements LoggerPort, LoggerStatsProviderPort {
  private state: LoggerState;
  private readonly stats = new WoodchopperStats();

  constructor(
    private readonly config: WoodchopperConfigType,
    private readonly deps: Dependencies,
  ) {
    this.state = LoggerState.open;

    this.config.dispatcher.onError = (error) => {
      this.config.diagnostics?.handle({ kind: "sink", error });
      this.stats.recordDeliveryFailure();
    };
  }

  private log(level: LogLevelEnum, entry: LoggerEntryBare) {
    if (this.state === LoggerState.closed) return this.stats.recordDropped();
    if (LOG_LEVEL_PRIORITY[level] > LOG_LEVEL_PRIORITY[this.config.level]) return this.stats.recordDropped();

    let withNormalization: LoggerEntryBare | LoggerEntryBareWithError;
    try {
      withNormalization =
        "error" in entry ? { ...entry, error: ErrorNormalizer.normalize(entry.error) } : entry;
    } catch (error) {
      this.stats.recordDropped();
      this.config.diagnostics?.handle({ kind: "normalization", error });
      return;
    }

    let withInjectedFields: LoggerEntry;
    try {
      withInjectedFields = {
        timestamp: new Date(this.deps.Clock.now().ms).toISOString(),
        level,
        app: this.config.app,
        environment: this.config.environment,
        ...withNormalization,
      };
    } catch (error) {
      this.stats.recordDropped();
      this.config.diagnostics?.handle({ kind: "clock", error });
      return;
    }

    let withRedaction: LoggerEntry;
    try {
      withRedaction = this.config.redactor
        ? this.config.redactor.redact(withInjectedFields)
        : withInjectedFields;
    } catch (error) {
      this.stats.recordDropped();
      this.config.diagnostics?.handle({ kind: "redaction", error });
      return;
    }

    const final = Object.freeze(withRedaction);

    this.config.dispatcher.dispatch(final) ? this.stats.recordWritten() : this.stats.recordDropped();
  }

  error: LoggerPort["error"] = (entry) => this.log(LogLevelEnum.error, entry);
  warn: LoggerPort["warn"] = (entry) => this.log(LogLevelEnum.warn, entry);
  info: LoggerPort["info"] = (entry) => this.log(LogLevelEnum.info, entry);
  http: LoggerPort["http"] = (entry) => this.log(LogLevelEnum.http, entry);
  verbose: LoggerPort["verbose"] = (entry) => this.log(LogLevelEnum.verbose, entry);
  debug: LoggerPort["debug"] = (entry) => this.log(LogLevelEnum.debug, entry);
  silly: LoggerPort["silly"] = (entry) => this.log(LogLevelEnum.silly, entry);

  close() {
    if (this.state === LoggerState.closed) return;

    this.state = LoggerState.closed;
    this.config.dispatcher.close();
  }

  getStats(): LoggerStatsSnapshot {
    return { ...this.stats.snapshot, state: this.state };
  }
}
