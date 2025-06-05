import { beforeEach, describe, expect, it, jest, mock } from "bun:test";
import * as winston from "winston";
import { LogLevelEnum, Logger } from "../src/logger";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

mock.module("winston", async () => {
  return {
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      http: jest.fn(),
      add: jest.fn(),
    })),
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    format: {
      json: jest.fn(() => "jsonFormat"),
      prettyPrint: jest.fn(() => "prettyPrintFormat"),
      combine: jest.fn((...args: any[]) => args),
    },
  };
});

describe("Logger", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a logger with default level 'verbose'", () => {
    new Logger({ app: "test-app", environment: NodeEnvironmentEnum.local });

    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevelEnum.verbose,
        format: ["jsonFormat", "prettyPrintFormat"],
        transports: expect.anything(),
      }),
    );
  });

  it("creates a logger with specified level", () => {
    new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
      level: LogLevelEnum.warn,
    });

    expect(winston.createLogger).toHaveBeenCalledWith(expect.objectContaining({ level: LogLevelEnum.warn }));
  });

  it("adds file transport in production", () => {
    new Logger({
      app: "prod-app",
      environment: NodeEnvironmentEnum.production,
    });

    const instance = (winston.createLogger as any).mock.results[0].value;
    expect(instance.add).toHaveBeenCalled();
  });

  it("does not add file transport outside production", () => {
    new Logger({ app: "test-app", environment: NodeEnvironmentEnum.local });

    const instance = (winston.createLogger as any).mock.results[0].value;
    expect(instance.add).not.toHaveBeenCalled();
  });

  it("logs info message", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });
    const instance = (winston.createLogger as any).mock.results[0].value;

    const logData = { message: "Info log", operation: "op" };
    logger.info(logData as any);

    expect(instance.info).toHaveBeenCalledWith(expect.objectContaining(logData));
  });

  it("logs warn message", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });
    const instance = (winston.createLogger as any).mock.results[0].value;

    const logData = { message: "Warning log", operation: "op" };
    logger.warn(logData as any);

    expect(instance.warn).toHaveBeenCalledWith(expect.objectContaining(logData));
  });

  it("logs error message", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });
    const instance = (winston.createLogger as any).mock.results[0].value;

    const logData = { message: "Error log", operation: "op" };
    logger.error(logData as any);

    expect(instance.error).toHaveBeenCalledWith(expect.objectContaining(logData));
  });

  it("logs http message", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });
    const instance = (winston.createLogger as any).mock.results[0].value;

    const logData = {
      message: "HTTP log",
      operation: "request",
      method: "GET",
      url: "/",
      client: {},
    };
    logger.http(logData as any);

    expect(instance.http).toHaveBeenCalledWith(expect.objectContaining(logData));
  });

  it("formats an error object correctly", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });

    const error = new Error("Test error");
    const formatted = logger.formatError(error);

    expect(formatted).toEqual({
      message: "Test error",
      name: "Error",
      stack: expect.any(String),
    });
  });

  it("formats non-error objects as empty error", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.local,
    });
    const formatted = logger.formatError("not an error");

    expect(formatted).toEqual({
      // @ts-expect-error
      message: undefined,
      // @ts-expect-error
      name: undefined,
      stack: undefined,
    });
  });

  it("getProductionLogFilePath", () => {
    const logger = new Logger({
      app: "test-app",
      environment: NodeEnvironmentEnum.production,
    });

    expect(logger.getProductionLogFilePath()).toEqual("/var/log/test-app-production.log");
  });
});
