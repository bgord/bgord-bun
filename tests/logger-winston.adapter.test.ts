import { describe, expect, test } from "bun:test";
import { Writable } from "node:stream";
import * as winston from "winston";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerWinstonAdapter } from "../src/logger-winston.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { RedactorMaskAdapter } from "../src/redactor-mask.adapter";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";

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

const redactor = new RedactorNoopAdapter();

describe("LoggerWinstonAdapter", () => {
  test("emits JSON with default meta", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
    });

    logger.info({ component: "emotions", operation: "entry_create", message: "Created entry" });

    expect(lines.length).toBeGreaterThan(0);

    const log = JSON.parse(lines[0] as string);
    expect(log.app).toEqual("test-app");
    expect(log.environment).toEqual("local");
    expect(log.component).toEqual("emotions");
    expect(log.operation).toEqual("entry_create");
    expect(typeof log.timestamp).toEqual("string");
    expect(log.level).toEqual("info");
  });

  test("respects level threshold", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
      redactor,
    });

    logger.http({
      component: "http",
      operation: "request",
      message: "before",
      method: "GET",
      url: "/",
      client: {},
    });

    expect(lines.length).toEqual(0);

    logger.warn({ component: "infra", operation: "rate_limit_hit", message: "Too many requests" });

    expect(lines.length).toEqual(1);
    const obj = JSON.parse(lines[0] as string);
    expect(obj.level).toEqual("warn");
  });

  test("preserves structured error", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
      redactor,
    });

    logger.error({
      component: "publishing",
      operation: "weekly_review_generate",
      message: "Failed",
      error: { name: "InvariantViolationError", message: "limit exceeded" },
    });

    const obj = JSON.parse(lines[0] as string);
    expect(obj.error.name).toEqual("InvariantViolationError");
    expect(obj.error.message).toEqual("limit exceeded");
  });

  test("logs HTTP fields", () => {
    const { transport, lines } = makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
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

    const log = JSON.parse(lines[0] as string);
    expect(log.method).toEqual("GET");
    expect(log.status).toEqual(200);
    expect(log.durationMs).toEqual(42);
    expect(log.client.ip).toEqual("1.2.3.4");
  });

  test("redactor", () => {
    const redactor = new RedactorMaskAdapter(["secret"]);
    const { transport, lines } = makeCaptureTransport();

    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
    });

    logger.info({
      component: "infra",
      operation: "read",
      message: "Env variables",
      metadata: { env: { secret: "abc" } },
    });

    const log = JSON.parse(lines[0] as string);
    expect(log.metadata).toEqual({ env: { secret: "***" } });
  });
});
