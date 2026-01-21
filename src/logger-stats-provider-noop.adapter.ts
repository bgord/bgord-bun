import {
  LoggerState,
  type LoggerStatsProviderPort,
  type LoggerStatsSnapshot,
} from "./logger-stats-provider.port";

export class LoggerStatsProviderNoopAdapter implements LoggerStatsProviderPort {
  getStats(): LoggerStatsSnapshot {
    return { state: LoggerState.open, dropped: 0, deliveryFailures: 0, written: 0 };
  }
}
