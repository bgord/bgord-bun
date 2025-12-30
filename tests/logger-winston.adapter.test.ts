import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerWinstonAdapter } from "../src/logger-winston.adapter";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";
import { RedactorNoopStrategy } from "../src/redactor-noop.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorNoopStrategy();
const filePath = tools.FilePathAbsolute.fromString("/var/www/logger.txt");

describe("LoggerWinstonAdapter", () => {
  test("default meta", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
      filePath,
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
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
      redactor,
      filePath,
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
    expect(JSON.parse(lines[0] as string).level).toEqual("warn");
  });

  test("error", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
      redactor,
      filePath,
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

  test("HTTP fields", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.http({
      component: "http",
      operation: "after",
      message: "response",
      method: "GET",
      url: "/api/entries",
      status: 200,
      durationMs: tools.DurationMs.parse(42),
      client: { ip: "1.2.3.4", userAgent: "UA" },
    });
    const log = JSON.parse(lines[0] as string);

    expect(log.method).toEqual("GET");
    expect(log.status).toEqual(200);
    expect(log.durationMs).toEqual(42);
    expect(log.client.ip).toEqual("1.2.3.4");
  });

  test("redactor", async () => {
    const redactor = new RedactorMaskStrategy(["secret"]);
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.info({
      component: "infra",
      operation: "read",
      message: "Env variables",
      metadata: { env: { secret: "abc" } },
    });

    expect(JSON.parse(lines[0] as string).metadata).toEqual({ env: { secret: "***" } });
  });
});
