export enum LoggerState {
  open = "open",
  closed = "closed",
}

export type LoggerStatsSnapshot = {
  accepted: number;
  dropped: number;
  deliveryFailures: number;
  state: LoggerState;
};

export interface LoggerStatsProviderPort {
  getStats(): LoggerStatsSnapshot;
}
