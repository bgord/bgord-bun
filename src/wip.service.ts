import type { CorrelationIdType } from "./correlation-id.vo";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type HttpClientInfo = { ip?: string; userAgent?: string };

export enum LogLevelEnum {
  error = "error",
  warn = "warn",
  info = "info",
  http = "http",
  verbose = "verbose",
  debug = "debug",
  silly = "silly",
}

export type LogCoreType = {
  /** ISO-8601 UTC string with milliseconds, e.g. 2025-08-23T18:42:31.123Z */
  timestamp: string;
  level: LogLevelEnum;
  app: string;
  environment: NodeEnvironmentEnum;
  /** Bounded context / subsystem, e.g., "http" | "emotions" | "publishing" | "infra" */
  component: string;
  /** Machine-friendly operation name, e.g., "weekly_review_generate" */
  operation: string;
  /** Short human-readable sentence */
  message: string;
  correlationId?: CorrelationIdType;
  metadata?: Record<string, unknown>;
};

export type LogHttpType = LogCoreType & {
  component: "http";
  method: HttpMethod;
  url: string;
  status?: number;
  durationMs?: number;
  client: HttpClientInfo;
  cacheHit?: boolean;
};
