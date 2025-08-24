import { z } from "zod/v4";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type HttpClientInfo = { ip?: string; userAgent?: string };

export type LogAppType = string;

export type ErrorInfo = {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
  cause?: { name?: string; message?: string };
};

export enum LogLevelEnum {
  error = "error",
  warn = "warn",
  info = "info",
  http = "http",
  verbose = "verbose",
  debug = "debug",
  silly = "silly",
}

export const LogLevel = z.enum(LogLevelEnum);

export type LogCoreType = {
  /** ISO-8601 UTC string with milliseconds, e.g. 2025-08-23T18:42:31.123Z */
  timestamp: string;
  level: LogLevelEnum;
  app: LogAppType;
  environment: NodeEnvironmentEnum;
  /** Bounded context / subsystem, e.g., "http" | "emotions" | "publishing" | "infra" */
  component: string;
  /** Machine-friendly operation name, e.g., "weekly_review_generate" */
  operation: string;
  /** Short human-readable sentence */
  message: string;
  correlationId?: CorrelationIdType;
  metadata?: Record<string, any>;
};

export type LogHttpType = LogCoreType & {
  level: LogLevelEnum.http;
  component: "http";
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  client: HttpClientInfo;
  cacheHit?: boolean;
};

export type LogErrorType = LogCoreType & { level: LogLevelEnum.error; error: ErrorInfo };

export type LogWarnType = LogCoreType & { level: LogLevelEnum.warn; error?: ErrorInfo };

export type AdapterInjectedFields = "timestamp" | "level" | "app" | "environment";

export interface LoggerPort {
  error(entry: Omit<LogErrorType, AdapterInjectedFields>): void;
  warn(entry: Omit<LogWarnType, AdapterInjectedFields>): void;
  info(entry: Omit<LogCoreType, AdapterInjectedFields>): void;
  http(entry: Omit<LogHttpType, AdapterInjectedFields>): void;
  verbose(entry: Omit<LogCoreType, AdapterInjectedFields>): void;
  debug(entry: Omit<LogCoreType, AdapterInjectedFields>): void;
  silly(entry: Omit<LogCoreType, AdapterInjectedFields>): void;

  setSilent(silent: boolean): void;
}
