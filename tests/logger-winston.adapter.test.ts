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

const log = { component: "emotions", operation: "entry_create", message: "Created entry" };

describe("LoggerWinstonAdapter", () => {
  test("info", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.info(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "info",
      timestamp: expect.any(String),
      ...log,
    });
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
    const log = {
      component: "publishing",
      operation: "weekly_review_generate",
      message: "Failed",
      error: { name: "InvariantViolationError", message: "limit exceeded" },
    };

    logger.error(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "error",
      timestamp: expect.any(String),
      ...log,
    });
  });

  test("warn", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.info,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.warn(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "warn",
      timestamp: expect.any(String),
      ...log,
    });
  });

  test("silly", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.silly,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.silly(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "silly",
      timestamp: expect.any(String),
      ...log,
    });
  });

  test("verbose", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.verbose,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.verbose(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "verbose",
      timestamp: expect.any(String),
      ...log,
    });
  });

  test("debug", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.debug,
      transports: [transport],
      redactor,
      filePath,
    });

    logger.debug(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "debug",
      timestamp: expect.any(String),
      ...log,
    });
  });

  test("http", () => {
    const { transport, lines } = mocks.makeCaptureTransport();
    const logger = new LoggerWinstonAdapter({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.http,
      transports: [transport],
      redactor,
      filePath,
    });
    const log = {
      component: "http",
      operation: "after",
      message: "response",
      method: "GET",
      url: "/api/entries",
      status: 200,
      durationMs: tools.DurationMs.parse(42),
      client: { ip: "1.2.3.4", userAgent: "UA" },
    } as const;

    logger.http(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      environment: "local",
      level: "http",
      timestamp: expect.any(String),
      ...log,
    });
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
    const log = {
      component: "infra",
      operation: "read",
      message: "Env variables",
      metadata: { env: { secret: "abc" } },
    };

    logger.info(log);

    expect(JSON.parse(lines[0] as string)).toEqual({
      app: "test-app",
      component: "infra",
      environment: "local",
      level: "info",
      message: "Env variables",
      metadata: { env: { secret: "***" } },
      operation: "read",
      timestamp: expect.any(String),
    });
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
});
