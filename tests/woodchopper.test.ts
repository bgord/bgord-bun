import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { RedactorCompactArrayStrategy } from "../src/redactor-compact-array.strategy";
import { RedactorCompositeStrategy } from "../src/redactor-composite.strategy";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";
import { RedactorNoopStrategy } from "../src/redactor-noop.strategy";
import { Woodchopper, WoodchopperState } from "../src/woodchopper";
import { WoodchopperSinkError } from "../src/woodchopper-sink-error.strategy";
import { WoodchopperSinkNoop } from "../src/woodchopper-sink-noop.strategy";
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
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("error - error instance", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entryWithErrorInstance);

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorInstance,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorInstanceFormatted,
    });
  });

  test("error - string", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entryWithErrorString);

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorString,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorStringFormatted,
    });
  });

  test("warn - no error", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.warn(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("warn - error instance", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.warn(entryWithErrorInstance);

    expect(sink.entries[0]).toEqual({
      ...entryWithErrorInstance,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorInstanceFormatted,
    });
  });

  test("warn - string", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.warn(entryWithErrorString);

    expect(sink.entries[0]).toEqual({
      ...entryWithErrorString,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: errorStringFormatted,
    });
  });

  test("info", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("http", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.http(entryHttp);

    expect(sink.entries[0]).toEqual({ ...config, ...entryHttp, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("verbose", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.verbose(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("debug", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.debug(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("silly", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.silly(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("level threshold - error", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(1);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 1, dropped: 6 });
  });

  test("level threshold - warn", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(2);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 2, dropped: 5 });
  });

  test("level threshold - info", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(3);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 3, dropped: 4 });
  });

  test("level threshold - http", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(4);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 4, dropped: 3 });
  });

  test("level threshold - verbose", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(5);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 5, dropped: 2 });
  });

  test("level threshold - debug", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(6);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 6, dropped: 1 });
  });

  test("level threshold - silly", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(7);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 7, dropped: 0 });
  });

  test("redactor - noop", () => {
    const sink = new WoodchopperSinkNoop();
    const redactor = new RedactorNoopStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, redactor }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("redactor - mask", () => {
    const sink = new WoodchopperSinkNoop();
    const redactor = new RedactorMaskStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, redactor }, deps);

    woodchopper.info({ ...entry, metadata: { password: "secret" } });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: { password: "***" },
    });
  });

  test("redactor - compact array", () => {
    const sink = new WoodchopperSinkNoop();
    const redactor = new RedactorCompactArrayStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, redactor }, deps);

    woodchopper.info({ ...entry, metadata: { users: ["1", "2", "3"] } });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: { users: { length: 3, type: "Array" } },
    });
  });

  test("redactor - composite", () => {
    const sink = new WoodchopperSinkNoop();
    const redactor = new RedactorCompositeStrategy([
      new RedactorNoopStrategy(),
      new RedactorMaskStrategy(),
      new RedactorCompactArrayStrategy(),
    ]);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, redactor }, deps);

    woodchopper.info({ ...entry, metadata: { password: "secret", users: ["1", "2", "3"] } });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: { users: { length: 3, type: "Array" }, password: "***" },
    });
  });

  test("close", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 1, dropped: 0 });

    woodchopper.close();
    woodchopper.close();

    woodchopper.info(entry);
    woodchopper.info(entry);

    expect(sink.entries.length).toEqual(1);
    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.closed, written: 1, dropped: 2 });
  });

  test("Object.freeze", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.info(entry);

    expect(Object.isFrozen(sink.entries[0])).toEqual(true);
  });

  test("getStats", () => {
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink }, deps);

    woodchopper.info(entry);
    woodchopper.info(entry);
    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 3, dropped: 0 });
  });

  test("diagnostics - sink", () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkError();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 0, dropped: 1 });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - redaction", () => {
    const redactor = new RedactorNoopStrategy();
    spyOn(redactor, "redact").mockImplementation(mocks.throwIntentionalError);
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, redactor, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 0, dropped: 1 });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "redaction",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - clock", () => {
    spyOn(Clock, "now").mockImplementation(mocks.throwIntentionalError);
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, sink, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({ state: WoodchopperState.open, written: 0, dropped: 1 });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "clock",
      error: { message: mocks.IntentionalError },
    });
  });
});
