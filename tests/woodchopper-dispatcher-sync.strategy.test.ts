import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDiagnosticsNoop } from "../src/woodchopper-diagnostics-noop.strategy";
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

  test("dispatch - error with diagnostics", () => {
    const diagnostics = new WoodchopperDiagnosticsNoop();
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });

    expect(dispatcher.dispatch(entry)).toEqual(false);
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: "woodchopper.sink.error" },
    });
  });

  test("dispatch - error without diagnostics", () => {
    const sink = new WoodchopperSinkError();
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(dispatcher.dispatch(entry)).toEqual(false);
  });

  test("close", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(() => dispatcher.close()).not.toThrow();
  });
});
