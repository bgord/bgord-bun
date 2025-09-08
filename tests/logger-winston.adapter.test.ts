import { describe, expect, test } from "bun:test";
import { Writable } from "node:stream";
import * as winston from "winston";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerWinstonAdapter } from "../src/logger-winston.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

export function makeCaptureTransport() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString()); // pretty or single-line JSON; both OK
      cb();
    },
  });

  const transport = new winston.transports.Stream({ stream });

  return { transport, lines };
}

describe("LoggerWinstonAdapter", () => {
  test("emits JSON with default meta", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
    });

    logger.info({
      component: "emotions",
      operation: "entry_create",
      message: "Created entry",
    });

    expect(lines.length).toBeGreaterThan(0);
    const obj = JSON.parse(lines[0] as string);
    expect(obj.app).toBe("test-app");
    expect(obj.environment).toBe("local");
    expect(obj.component).toBe("emotions");
    expect(obj.operation).toBe("entry_create");
    expect(typeof obj.timestamp).toBe("string");
    expect(obj.level).toBe("info");
  });

  test("respects level threshold", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
    });

    logger.http({
      component: "http",
      operation: "request",
      message: "before",
      method: "GET",
      url: "/",
      client: {},
    });

    expect(lines.length).toBe(0);

    logger.warn({
      component: "infra",
      operation: "rate_limit_hit",
      message: "Too many requests",
    });

    expect(lines.length).toBe(1);
    const obj = JSON.parse(lines[0] as string);
    expect(obj.level).toBe("warn");
  });

  test("preserves structured error", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
    });

    logger.error({
      component: "publishing",
      operation: "weekly_review_generate",
      message: "Failed",
      error: { name: "InvariantViolationError", message: "limit exceeded" },
    });

    const obj = JSON.parse(lines[0] as string);
    expect(obj.error.name).toBe("InvariantViolationError");
    expect(obj.error.message).toBe("limit exceeded");
  });

  test("logs HTTP fields", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
    });

    logger.http({
      component: "http",
      operation: "after",
      message: "response",
      method: "GET",
      url: "/api/entries",
      status: 200,
      durationMs: 42,
      client: { ip: "1.2.3.4", userAgent: "UA" },
    });

    const obj = JSON.parse(lines[0] as string);
    expect(obj.method).toBe("GET");
    expect(obj.status).toBe(200);
    expect(obj.durationMs).toBe(42);
    expect(obj.client.ip).toBe("1.2.3.4");
  });
});
