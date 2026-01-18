import { describe, expect, jest, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Woodchopper } from "../src/woodchopper";
import * as mocks from "./mocks";

const config = { app: "woodchopper", level: LogLevelEnum.silly, environment: NodeEnvironmentEnum.local };

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

describe("Woodchopper", () => {
  test("constructor", () => {
    expect(() => new Woodchopper(config, deps)).not.toThrow();
  });

  test("error - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "error", component: "infra", operation: "test" };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("error - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = {
      message: "error",
      component: "infra",
      operation: "test",
      error: new Error(mocks.IntentionalError),
    };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
      error: { cause: undefined, message: mocks.IntentionalError, name: "Error", stack: expect.any(String) },
    });
  });

  test("error - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "error", component: "infra", operation: "test", error: mocks.IntentionalError };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
      error: { message: mocks.IntentionalError },
    });
  });

  test("warn - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "warn", component: "infra", operation: "test" };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("warn - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = {
      message: "warn",
      component: "infra",
      operation: "test",
      error: new Error(mocks.IntentionalError),
    };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
      error: { cause: undefined, message: mocks.IntentionalError, name: "Error", stack: expect.any(String) },
    });
  });

  test("warn - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "warn", component: "infra", operation: "test", error: mocks.IntentionalError };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
      error: { message: mocks.IntentionalError },
    });
  });

  test("info", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "info", component: "infra", operation: "test" };
    woodchopper.info(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("http", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = {
      message: "http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const;
    woodchopper.http(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.http,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("verbose", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "verbose", component: "infra", operation: "test" };
    woodchopper.verbose(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.verbose,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("debug", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "debug", component: "infra", operation: "test" };
    woodchopper.debug(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.debug,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });

  test("silly", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "silly", component: "infra", operation: "test" };
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.silly,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
  });
});
