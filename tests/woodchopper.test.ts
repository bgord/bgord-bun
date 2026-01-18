import { describe, expect, jest, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Woodchopper } from "../src/woodchopper";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

describe("Woodchopper", () => {
  test("error - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.error, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "error", component: "infra", operation: "test" };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({ timestamp: mocks.TIME_ZERO_ISO, ...config, ...entry });
  });

  test("error - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.error, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = {
      message: "error",
      component: "infra",
      operation: "test",
      error: new Error(mocks.IntentionalError),
    };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { cause: undefined, message: mocks.IntentionalError, name: "Error", stack: expect.any(String) },
    });
  });

  test("error - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.error, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "error", component: "infra", operation: "test", error: mocks.IntentionalError };
    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { message: mocks.IntentionalError },
    });
  });

  test("warn - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.warn, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "warn", component: "infra", operation: "test" };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({ timestamp: mocks.TIME_ZERO_ISO, ...config, ...entry });
  });

  test("warn - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.warn, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = {
      message: "warn",
      component: "infra",
      operation: "test",
      error: new Error(mocks.IntentionalError),
    };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({
      ...entry,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { cause: undefined, message: mocks.IntentionalError, name: "Error", stack: expect.any(String) },
    });
  });

  test("warn - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.warn, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "warn", component: "infra", operation: "test", error: mocks.IntentionalError };
    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({
      ...entry,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { message: mocks.IntentionalError },
    });
  });

  test("info", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.info, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "info", component: "infra", operation: "test" };
    woodchopper.info(entry);

    expect(sink).toHaveBeenCalledWith({ timestamp: mocks.TIME_ZERO_ISO, ...config, ...entry });
  });

  test("http", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.http, environment: NodeEnvironmentEnum.local };
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

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("verbose", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = {
      app: "woodchopper",
      level: LogLevelEnum.verbose,
      environment: NodeEnvironmentEnum.local,
    };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "verbose", component: "infra", operation: "test" };
    woodchopper.verbose(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("debug", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = {
      app: "woodchopper",
      level: LogLevelEnum.debug,
      environment: NodeEnvironmentEnum.local,
    };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "debug", component: "infra", operation: "test" };
    woodchopper.debug(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("silly", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.silly, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "silly", component: "infra", operation: "test" };
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("level threshold - error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.error, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level error", component: "infra", operation: "test" };
    woodchopper.error(entry);

    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledWith({
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(1);
  });

  test("level threshold - warn", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.warn, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level warn", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(2);
  });

  test("level threshold - info", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.info, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level info", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(3, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(3);
  });

  test("level threshold - http", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app: "woodchopper", level: LogLevelEnum.http, environment: NodeEnvironmentEnum.local };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level http", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(3, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(4, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.http,
      timestamp: mocks.TIME_ZERO_ISO,
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    });
    expect(sink).toHaveBeenCalledTimes(4);
  });

  test("level threshold - verbose", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = {
      app: "woodchopper",
      level: LogLevelEnum.verbose,
      environment: NodeEnvironmentEnum.local,
    };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level http", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(3, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(4, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.http,
      timestamp: mocks.TIME_ZERO_ISO,
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    });
    expect(sink).toHaveBeenNthCalledWith(5, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.verbose,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(5);
  });

  test("level threshold - debug", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = {
      app: "woodchopper",
      level: LogLevelEnum.debug,
      environment: NodeEnvironmentEnum.local,
    };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level debug", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(3, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(4, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.http,
      timestamp: mocks.TIME_ZERO_ISO,
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    });
    expect(sink).toHaveBeenNthCalledWith(5, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.verbose,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(6, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.debug,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(6);
  });

  test("level threshold - silly", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = {
      app: "woodchopper",
      level: LogLevelEnum.silly,
      environment: NodeEnvironmentEnum.local,
    };
    const woodchopper = new Woodchopper(config, deps);

    const entry = { message: "level silly", component: "infra", operation: "test" };
    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http({
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    } as const);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenNthCalledWith(1, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.error,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(2, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.warn,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(3, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.info,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(4, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.http,
      timestamp: mocks.TIME_ZERO_ISO,
      message: "level http",
      component: "http",
      operation: "test",
      method: "GET",
      url: "http://localhost:3000",
      client: { userAgent: "mozilla", ip: "1.1.1.1" },
    });
    expect(sink).toHaveBeenNthCalledWith(5, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.verbose,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(6, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.debug,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenNthCalledWith(7, {
      app: config.app,
      environment: config.environment,
      level: LogLevelEnum.silly,
      timestamp: mocks.TIME_ZERO_ISO,
      ...entry,
    });
    expect(sink).toHaveBeenCalledTimes(7);
  });
});
