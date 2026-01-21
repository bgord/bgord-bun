export enum LoggerState {
  open = "open",
  closed = "closed",
}

export type LoggerStatsSnapshot = {
  written: number;
  dropped: number;
  deliveryFailures: number;
  state: LoggerState;
};

export interface LoggerStatsProviderPort {
  getStats(): LoggerStatsSnapshot;
}
