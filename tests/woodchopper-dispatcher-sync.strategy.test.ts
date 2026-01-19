import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
import { WoodchopperSinkError } from "../src/woodchopper-sink-error.strategy";
import { WoodchopperSinkNoop } from "../src/woodchopper-sink-noop.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.error,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};

describe("WoodchopperDispatcherSync", () => {
  test("dispatch", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(sink.entries[0]).toEqual(entry);
  });

  test("dispatch - error", () => {
    const collector = new mocks.DiagnosticCollector();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    dispatcher.onError = (error) => collector.handle({ kind: "sink", error });

    expect(dispatcher.dispatch(entry)).toEqual(false);
    expect(collector.diagnostics[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("close", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(() => dispatcher.close()).not.toThrow();
  });
});
