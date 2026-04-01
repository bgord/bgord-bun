import type { LoggerPort } from "./logger.port";
import {
  LoggerState,
  type LoggerStatsProviderPort,
  type LoggerStatsSnapshot,
} from "./logger-stats-provider.port";

export class LoggerNoopAdapter implements LoggerPort, LoggerStatsProviderPort {
  error: LoggerPort["error"] = (_log): void => {};
  warn: LoggerPort["warn"] = (_log): void => {};
  info: LoggerPort["info"] = (_log): void => {};
  http: LoggerPort["http"] = (_log): void => {};
  verbose: LoggerPort["verbose"] = (_log): void => {};
  debug: LoggerPort["debug"] = (_log): void => {};
  silly: LoggerPort["silly"] = (_log): void => {};

  close() {}

  getStats(): LoggerStatsSnapshot {
    return { written: 0, dropped: 0, deliveryFailures: 0, state: LoggerState.open };
  }
}
