import type { LoggerPort } from "./logger.port";
import { LoggerState, type LoggerStatsSnapshot } from "./logger-stats-provider.port";

export class LoggerNoopAdapter implements LoggerPort {
  warn: LoggerPort["warn"] = (_log): void => {};
  error: LoggerPort["error"] = (_log): void => {};
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
