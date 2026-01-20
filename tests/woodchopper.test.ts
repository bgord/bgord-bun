import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as format from "../src/format-error.service";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { RedactorCompactArrayStrategy } from "../src/redactor-compact-array.strategy";
import { RedactorCompositeStrategy } from "../src/redactor-composite.strategy";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";
import { RedactorNoopStrategy } from "../src/redactor-noop.strategy";
import { Woodchopper, WoodchopperState } from "../src/woodchopper";
import { WoodchopperDispatcherAsync } from "../src/woodchopper-dispatcher-async.strategy";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
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

describe("Woodchopper", async () => {
  test("error - no error", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("error - error instance", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.warn(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("warn - error instance", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("http", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.http(entryHttp);

    expect(sink.entries[0]).toEqual({ ...config, ...entryHttp, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("verbose", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.verbose(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("debug", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.debug(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("silly", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.silly(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("level threshold - error", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(1);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 1,
      dropped: 6,
      deliveryFailures: 0,
    });
  });

  test("level threshold - warn", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(2);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 2,
      dropped: 5,
      deliveryFailures: 0,
    });
  });

  test("level threshold - info", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(3);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 3,
      dropped: 4,
      deliveryFailures: 0,
    });
  });

  test("level threshold - http", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(4);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 4,
      dropped: 3,
      deliveryFailures: 0,
    });
  });

  test("level threshold - verbose", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(5);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 5,
      dropped: 2,
      deliveryFailures: 0,
    });
  });

  test("level threshold - debug", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(6);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 6,
      dropped: 1,
      deliveryFailures: 0,
    });
  });

  test("level threshold - silly", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);
    woodchopper.warn(entry);
    woodchopper.info(entry);
    woodchopper.http(entryHttp);
    woodchopper.verbose(entry);
    woodchopper.debug(entry);
    woodchopper.silly(entry);

    expect(sink.entries.length).toEqual(7);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 7,
      dropped: 0,
      deliveryFailures: 0,
    });
  });

  test("redactor - noop", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorNoopStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("redactor - mask", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorMaskStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorCompactArrayStrategy();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

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
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorCompositeStrategy([
      new RedactorNoopStrategy(),
      new RedactorMaskStrategy(),
      new RedactorCompactArrayStrategy(),
    ]);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    woodchopper.info({ ...entry, metadata: { password: "secret", users: ["1", "2", "3"] } });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: { users: { length: 3, type: "Array" }, password: "***" },
    });
  });

  test("close - idempotency - dispatcher sync", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);
    const dispatcherClose = spyOn(dispatcher, "close");

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 1,
      dropped: 0,
      deliveryFailures: 0,
    });

    woodchopper.close();
    woodchopper.close();

    woodchopper.info(entry);
    woodchopper.info(entry);

    expect(sink.entries.length).toEqual(1);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.closed,
      written: 1,
      dropped: 2,
      deliveryFailures: 0,
    });
    expect(dispatcherClose).toHaveBeenCalledTimes(1);
  });

  test("close - idempotency - dispatcher async", async () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink);
    dispatcher.onError = (error) => collector.handle({ kind: "sink", error });
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);
    const dispatcherClose = spyOn(dispatcher, "close");

    woodchopper.info(entry);

    await mocks.tick();

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 1,
      dropped: 0,
      deliveryFailures: 0,
    });

    woodchopper.close();
    woodchopper.close();

    woodchopper.info(entry);
    woodchopper.info(entry);

    expect(sink.entries.length).toEqual(1);
    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.closed,
      written: 1,
      dropped: 2,
      deliveryFailures: 0,
    });
    expect(dispatcherClose).toHaveBeenCalledTimes(1);
    expect(collector.diagnostics.length).toEqual(0);
  });

  test("Object.freeze", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(Object.isFrozen(sink.entries[0])).toEqual(true);
  });

  test("getStats", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);
    woodchopper.info(entry);
    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 3,
      dropped: 0,
      deliveryFailures: 0,
    });
  });

  test("diagnostics - normalization", () => {
    spyOn(format, "formatError").mockImplementationOnce(mocks.throwIntentionalError);
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, onDiagnostic: collector.handle }, deps);

    woodchopper.error({ ...entry, error: mocks.IntentionalError });

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "normalization",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - clock", () => {
    spyOn(Clock, "now").mockImplementationOnce(mocks.throwIntentionalError);
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "clock",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - redaction", () => {
    const redactor = new RedactorNoopStrategy();
    spyOn(redactor, "redact").mockImplementationOnce(mocks.throwIntentionalError);
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper(
      { ...config, dispatcher, redactor, onDiagnostic: collector.handle },
      deps,
    );

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "redaction",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - sink - dispatcher sync", () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 1,
    });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("diagnostics - sink - dispatcher async", async () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 100);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, onDiagnostic: collector.handle }, deps);

    woodchopper.info(entry);

    await mocks.tick();

    expect(woodchopper.getStats()).toEqual({
      state: WoodchopperState.open,
      written: 1,
      dropped: 0,
      deliveryFailures: 1,
    });
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });
});
