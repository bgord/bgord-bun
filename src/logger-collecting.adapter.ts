import type { LogErrorType, LoggerEntryBare, LoggerPort } from "./logger.port";

export class LoggerCollectingAdapter implements LoggerPort {
  readonly entries: (LoggerEntryBare | LogErrorType)[] = [];

  warn: LoggerPort["warn"] = (log): void => {
    this.entries.push(log);
  };
  error: LoggerPort["error"] = (log): void => {
    this.entries.push(log);
  };
  info: LoggerPort["info"] = (log): void => {
    this.entries.push(log);
  };
  http: LoggerPort["http"] = (log): void => {
    this.entries.push(log);
  };
  verbose: LoggerPort["verbose"] = (log): void => {
    this.entries.push(log);
  };
  debug: LoggerPort["debug"] = (log): void => {
    this.entries.push(log);
  };
  silly: LoggerPort["silly"] = (log): void => {
    this.entries.push(log);
  };

  close() {}
}
