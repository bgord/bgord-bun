import type * as tools from "@bgord/tools";
import * as z from "zod/v4";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type LoggerAppType = string;

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
  timestamp: string;
  level: LogLevelEnum;
  app: LoggerAppType;
  environment: NodeEnvironmentEnum;
  component: string;
  operation: string;
  message: string;
  correlationId?: CorrelationIdType;
  metadata?: Record<string, any>;
};

export type HttpClientInfo = { ip?: string; userAgent?: string };
export type LogHttpType = LogCoreType & {
  level: LogLevelEnum.http;
  component: "http";
  method: string;
  url: string;
  status?: number;
  durationMs?: tools.DurationMsType;
  client: HttpClientInfo;
  cacheHit?: boolean;
};

export type LogErrorType = LogCoreType & { level: LogLevelEnum.error; error: ErrorInfo | null };

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
}
