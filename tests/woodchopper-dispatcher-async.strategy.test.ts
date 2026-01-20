import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDiagnosticsNoop } from "../src/woodchopper-diagnostics-noop.strategy";
import { WoodchopperDispatcherAsync } from "../src/woodchopper-dispatcher-async.strategy";
import { WoodchopperSinkError } from "../src/woodchopper-sink-error.strategy";
import { WoodchopperSinkNoop } from "../src/woodchopper-sink-noop.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};

describe("WoodchopperDispatcherAsync", () => {
  test("dispatch", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 10);

    expect(dispatcher.dispatch(entry)).toEqual(true);

    await mocks.tick();

    expect(sink.entries).toEqual([entry]);
  });

  test("dispatch - order", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 10);

    expect(dispatcher.dispatch({ ...entry, message: "1" })).toEqual(true);
    expect(dispatcher.dispatch({ ...entry, message: "2" })).toEqual(true);
    expect(dispatcher.dispatch({ ...entry, message: "3" })).toEqual(true);

    await mocks.tick();

    expect(sink.entries).toEqual([
      { ...entry, message: "1" },
      { ...entry, message: "2" },
      { ...entry, message: "3" },
    ]);
  });

  test("dispatch - capacity", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 1);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(dispatcher.dispatch(entry)).toEqual(false);

    await mocks.tick();

    expect(sink.entries.length).toEqual(1);
  });

  test("dispatch - error", async () => {
    const diagnostics = new WoodchopperDiagnosticsNoop();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 1);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(diagnostics.entries.length).toEqual(0);

    expect(dispatcher.dispatch(entry)).toEqual(false);

    await mocks.tick();

    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("idle", async () => {
    const sink = new WoodchopperSinkNoop();
    new WoodchopperDispatcherAsync(sink, 10);

    await mocks.tick();

    expect(sink.entries.length).toEqual(0);
  });

  test("close", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 10);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    dispatcher.close();

    await mocks.tick();

    expect(sink.entries.length).toEqual(0);

    expect(dispatcher.dispatch(entry)).toEqual(false);
  });

  test("close - cloes with buffered entries", async () => {
    const diagnostics = new WoodchopperDiagnosticsNoop();
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherAsync(sink, 10);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });

    dispatcher.dispatch(entry);
    await mocks.tick();
    dispatcher.dispatch(entry);
    dispatcher.close();
    await mocks.tick();

    expect(diagnostics.entries).toMatchObject([
      { kind: "sink", error: { message: "woodchopper.dispatcher.async.closed.with.buffered.entries.1" } },
    ]);
  });
});
