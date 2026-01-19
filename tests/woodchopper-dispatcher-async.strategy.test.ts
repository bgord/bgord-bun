import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperAsyncDispatcher } from "../src/woodchopper-dispatcher-async.strategy";
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

async function tick() {
  await Promise.resolve();
}

describe("WoodchopperAsyncDispatcher", () => {
  test("dispatch", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperAsyncDispatcher(sink, 10);

    expect(dispatcher.dispatch(entry)).toEqual(true);

    await tick();

    expect(sink.entries).toEqual([entry]);
  });

  test("dispatch - capacity", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperAsyncDispatcher(sink, 1);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(dispatcher.dispatch(entry)).toEqual(false);

    await tick();

    expect(sink.entries.length).toEqual(1);
  });

  test("dispatch - error", async () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperAsyncDispatcher(sink, 1, (error) =>
      collector.handle({ kind: "sink", error }),
    );

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(collector.diagnostics.length).toEqual(0);

    expect(dispatcher.dispatch(entry)).toEqual(false);

    await tick();

    expect(collector.diagnostics[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("idle", async () => {
    const sink = new WoodchopperSinkNoop();
    new WoodchopperAsyncDispatcher(sink, 10);

    await tick();

    expect(sink.entries.length).toEqual(0);
  });

  test("close", async () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperAsyncDispatcher(sink, 10);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    dispatcher.close();

    await tick();

    expect(sink.entries.length).toEqual(0);

    expect(dispatcher.dispatch(entry)).toEqual(false);
  });
});
