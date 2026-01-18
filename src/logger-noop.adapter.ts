import type { LoggerPort } from "./logger.port";

export class LoggerNoopAdapter implements LoggerPort {
  warn: LoggerPort["warn"] = (_log) => {};
  error: LoggerPort["error"] = (_log) => {};
  info: LoggerPort["info"] = (_log) => {};
  http: LoggerPort["http"] = (_log) => {};
  verbose: LoggerPort["verbose"] = (_log) => {};
  debug: LoggerPort["debug"] = (_log) => {};
  silly: LoggerPort["silly"] = (_log) => {};

  getFilePath() {
    return null;
  }
}
