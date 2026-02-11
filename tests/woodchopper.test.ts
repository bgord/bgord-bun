import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { ErrorNormalizer } from "../src/error-normalizer.service";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerState } from "../src/logger-stats-provider.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { RedactorComposite } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimit } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHide } from "../src/redactor-error-stack-hide.strategy";
import { RedactorMask } from "../src/redactor-mask.strategy";
import { RedactorMetadataCompactArray } from "../src/redactor-metadata-compact-array.strategy";
import { RedactorMetadataCompactObject } from "../src/redactor-metadata-compact-object.strategy";
import { RedactorNoop } from "../src/redactor-noop.strategy";
import { Woodchopper } from "../src/woodchopper";
import { WoodchopperDiagnosticsCollecting } from "../src/woodchopper-diagnostics-collecting.strategy";
import { WoodchopperDispatcherAsync } from "../src/woodchopper-dispatcher-async.strategy";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
import { WoodchopperSinkCollecting } from "../src/woodchopper-sink-collecting.strategy";
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
  client: { ua: mocks.ua, ip: mocks.ip },
} as const;
const entryWithErrorInstance = { ...entry, error: new Error(mocks.IntentionalError) };
const entryWithErrorString = { ...entry, error: mocks.IntentionalError };

describe("Woodchopper", async () => {
  test("error - no error", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("error - error instance", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entryWithErrorInstance);

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorInstance,
      timestamp: mocks.TIME_ZERO_ISO,
      error: mocks.IntentionalErrorNormalized,
    });
  });

  test("error - string", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error(entryWithErrorString);

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorString,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { message: mocks.IntentionalError },
    });
  });

  test("warn - no error", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.warn(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("warn - error instance", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.warn(entryWithErrorInstance);

    expect(sink.entries[0]).toEqual({
      ...entryWithErrorInstance,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: mocks.IntentionalErrorNormalized,
    });
  });

  test("warn - string", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.warn, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.warn(entryWithErrorString);

    expect(sink.entries[0]).toEqual({
      ...entryWithErrorString,
      ...config,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { message: mocks.IntentionalError },
    });
  });

  test("info", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("http", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.http, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.http(entryHttp);

    expect(sink.entries[0]).toEqual({ ...config, ...entryHttp, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("verbose", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.verbose, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.verbose(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("debug", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.debug, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.debug(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("silly", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.silly, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.silly(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("level threshold - error", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 1,
      dropped: 6,
      deliveryFailures: 0,
    });
  });

  test("level threshold - warn", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 2,
      dropped: 5,
      deliveryFailures: 0,
    });
  });

  test("level threshold - info", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 3,
      dropped: 4,
      deliveryFailures: 0,
    });
  });

  test("level threshold - http", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 4,
      dropped: 3,
      deliveryFailures: 0,
    });
  });

  test("level threshold - verbose", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 5,
      dropped: 2,
      deliveryFailures: 0,
    });
  });

  test("level threshold - debug", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 6,
      dropped: 1,
      deliveryFailures: 0,
    });
  });

  test("level threshold - silly", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 7,
      dropped: 0,
      deliveryFailures: 0,
    });
  });

  test("redactor - noop", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorNoop();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
  });

  test("redactor - mask", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorMask();
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

  test("redactor - metadata compact array", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorMetadataCompactArray({ maxItems: tools.IntegerPositive.parse(2) });
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

  test("redactor - metadata compact object", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorMetadataCompactObject({ maxKeys: tools.IntegerPositive.parse(2) });
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    woodchopper.info({ ...entry, metadata: { users: { admins: 1, users: 1, bots: 1 } } });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: { users: { type: "Object", keys: 3 } },
    });
  });

  test("redactor - error stack hide", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorErrorStackHide();
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);
    woodchopper.error({ ...entryWithErrorInstance });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorInstance,
      timestamp: mocks.TIME_ZERO_ISO,
      error: { ...mocks.IntentionalErrorNormalized, stack: undefined },
    });
  });

  test("redactor - error cause depth limit", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorErrorCauseDepthLimit(tools.IntegerNonNegative.parse(1));
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    const error = new Error(mocks.IntentionalError);
    const first = new Error(mocks.IntentionalCause);
    const second = new Error(mocks.IntentionalCause);
    error.cause = first;
    first.cause = second;

    woodchopper.error({ ...entry, error });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entryWithErrorInstance,
      timestamp: mocks.TIME_ZERO_ISO,
      error: {
        ...mocks.IntentionalErrorNormalized,
        cause: { name: "Error", message: mocks.IntentionalCause, stack: expect.any(String) },
      },
    });
  });

  test("redactor - composite", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const redactor = new RedactorComposite([
      new RedactorNoop(),
      new RedactorMask(),
      new RedactorMetadataCompactArray({ maxItems: tools.IntegerPositive.parse(2) }),
      new RedactorMetadataCompactObject({ maxKeys: tools.IntegerPositive.parse(3) }),
      new RedactorErrorStackHide(),
      new RedactorErrorCauseDepthLimit(tools.IntegerNonNegative.parse(1)),
    ]);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    const error = new Error(mocks.IntentionalError);
    const first = new Error(mocks.IntentionalCause);
    const second = new Error(mocks.IntentionalCause);
    error.cause = first;
    first.cause = second;

    woodchopper.error({
      ...entry,
      error,
      metadata: {
        password: "secret",
        users: ["1", "2", "3"],
        types: { admin: true, user: true, api: true, bots: true },
      },
    });

    expect(sink.entries[0]).toEqual({
      ...config,
      ...entry,
      timestamp: mocks.TIME_ZERO_ISO,
      error: {
        ...mocks.IntentionalErrorNormalized,
        stack: undefined,
        cause: { cause: undefined, message: mocks.IntentionalCause, name: "Error" },
      },
      metadata: { password: "***", users: { length: 3, type: "Array" }, types: { type: "Object", keys: 4 } },
    });
  });

  test("close - idempotency - dispatcher sync", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    using dispatcherClose = spyOn(dispatcher, "close");
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
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
      state: LoggerState.closed,
      written: 1,
      dropped: 2,
      deliveryFailures: 0,
    });
    expect(dispatcherClose).toHaveBeenCalledTimes(1);
  });

  test("close - idempotency - dispatcher async", async () => {
    const sink = new WoodchopperSinkCollecting();
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const dispatcher = new WoodchopperDispatcherAsync(sink);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });
    using dispatcherClose = spyOn(dispatcher, "close");
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    await mocks.tick();

    expect(sink.entries[0]).toEqual({ ...config, ...entry, timestamp: mocks.TIME_ZERO_ISO });
    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
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
      state: LoggerState.closed,
      written: 1,
      dropped: 2,
      deliveryFailures: 0,
    });
    expect(dispatcherClose).toHaveBeenCalledTimes(1);
    expect(diagnostics.entries.length).toEqual(0);
  });

  test("Object.freeze", () => {
    const sink = new WoodchopperSinkCollecting();
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
      state: LoggerState.open,
      written: 3,
      dropped: 0,
      deliveryFailures: 0,
    });
  });

  test("pipeline - normalization - diagnostics", () => {
    using _ = spyOn(ErrorNormalizer, "normalize").mockImplementationOnce(mocks.throwIntentionalError);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, diagnostics }, deps);

    woodchopper.error({ ...entry, error: mocks.IntentionalError });

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "normalization",
      error: { message: mocks.IntentionalError },
    });
  });

  test("pipeline - normalization - no diagnostics", () => {
    using _ = spyOn(ErrorNormalizer, "normalize").mockImplementationOnce(mocks.throwIntentionalError);
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.error, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.error({ ...entry, error: mocks.IntentionalError });

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
  });

  test("pipeline - clock - diagnostics", () => {
    using _ = spyOn(Clock, "now").mockImplementationOnce(mocks.throwIntentionalError);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, diagnostics }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "clock",
      error: { message: mocks.IntentionalError },
    });
  });

  test("pipeline - clock - no diagnostics", () => {
    using _ = spyOn(Clock, "now").mockImplementationOnce(mocks.throwIntentionalError);
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
  });

  test("pipeline - redaction - diagnostics", () => {
    const redactor = new RedactorNoop();
    using _ = spyOn(redactor, "redact").mockImplementationOnce(mocks.throwIntentionalError);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor, diagnostics }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "redaction",
      error: { message: mocks.IntentionalError },
    });
  });

  test("pipeline - redaction - no diagnostics", () => {
    const redactor = new RedactorNoop();
    using _ = spyOn(redactor, "redact").mockImplementationOnce(mocks.throwIntentionalError);
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, redactor }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 0,
    });
  });

  test("pipeline - sink - dispatcher sync - diagnostics", () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, diagnostics }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 1,
    });
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("pipeline - sink - dispatcher sync - no diagnostics", () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const dispatcher = new WoodchopperDispatcherSync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 0,
      dropped: 1,
      deliveryFailures: 1,
    });
  });

  test("pipeline - sink - dispatcher async - diagnostics", async () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const dispatcher = new WoodchopperDispatcherAsync(sink);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher, diagnostics }, deps);

    woodchopper.info(entry);

    await mocks.tick();

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 1,
      dropped: 0,
      deliveryFailures: 1,
    });
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("pipeline - sink - dispatcher async - no diagnostics", async () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const dispatcher = new WoodchopperDispatcherAsync(sink);
    const config = { app, level: LogLevelEnum.info, environment };
    const woodchopper = new Woodchopper({ ...config, dispatcher }, deps);

    woodchopper.info(entry);

    await mocks.tick();

    expect(woodchopper.getStats()).toEqual({
      state: LoggerState.open,
      written: 1,
      dropped: 0,
      deliveryFailures: 1,
    });
  });
});
