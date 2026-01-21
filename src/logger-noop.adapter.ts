import type { LoggerPort } from "./logger.port";
import { LoggerStatsProviderPort, LoggerStatsSnapshot, LoggerState } from "./logger-stats-provider.port";

export class LoggerNoopAdapter implements LoggerPort, LoggerStatsProviderPort {
  warn: LoggerPort["warn"] = (_log): void => {};
  error: LoggerPort["error"] = (_log): void => {};
  info: LoggerPort["info"] = (_log): void => {};
  http: LoggerPort["http"] = (_log): void => {};
  verbose: LoggerPort["verbose"] = (_log): void => {};
  debug: LoggerPort["debug"] = (_log): void => {};
  silly: LoggerPort["silly"] = (_log): void => {};

  close() {}

  getStats(): LoggerStatsSnapshot {
    return { state: LoggerState.open, dropped: 0, deliveryFailures: 0, written: 0 };
  }
}
