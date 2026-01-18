import { describe, expect, jest, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Woodchopper } from "../src/woodchopper";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

const app = "woodchopper";
const environment = NodeEnvironmentEnum.local;
const message = "message";

const entry = { message, component: "infra", operation: "test" };
const entryHttp = {
  message,
  component: "http",
  operation: "test",
  method: "GET",
  url: "http://localhost:3000",
  client: { userAgent: "mozilla", ip: "1.1.1.1" },
} as const;
const entryWithErrorInstance = { ...entry, error: new Error(mocks.IntentionalError) };
const entryWithErrorString = { ...entry, error: mocks.IntentionalError };

const errorInstanceFormatted = {
  cause: undefined,
  message: mocks.IntentionalError,
  name: "Error",
  stack: expect.any(String),
};
const errorStringFormatted = { message: mocks.IntentionalError };

describe("Woodchopper", () => {
  test("error - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("error - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entryWithErrorInstance);

    expect(sink).toHaveBeenCalledWith({
      ...config,
      ...entryWithErrorInstance,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorInstanceFormatted,
    });
  });

  test("error - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entryWithErrorString);

    expect(sink).toHaveBeenCalledWith({
      ...config,
      ...entryWithErrorString,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorStringFormatted,
    });
  });

  test("warn - no error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.warn(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("warn - error instance", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.warn(entryWithErrorInstance);

    expect(sink).toHaveBeenCalledWith({
      ...entryWithErrorInstance,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorInstanceFormatted,
    });
  });

  test("warn - string", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.warn(entryWithErrorString);

    expect(sink).toHaveBeenCalledWith({
      ...entryWithErrorString,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorStringFormatted,
    });
  });

  test("info", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.info(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("http", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.http(entryHttp);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entryHttp, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("verbose", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.verbose(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("debug", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.debug(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("silly", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledWith({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("level threshold - error", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(1);
  });

  test("level threshold - warn", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(2);
  });

  test("level threshold - info", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(3);
  });

  test("level threshold - http", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(4);
  });

  test("level threshold - verbose", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(5);
  });

  test("level threshold - debug", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(6);
  });

  test("level threshold - silly", () => {
    const sink = spyOn(console, "log").mockImplementation(jest.fn());
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper(config, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink).toHaveBeenCalledTimes(7);
  });
});
