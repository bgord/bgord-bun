import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDiagnosticsCollecting } from "../src/woodchopper-diagnostics-collecting.strategy";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
import { WoodchopperSinkCollecting } from "../src/woodchopper-sink-collecting.strategy";
import { WoodchopperSinkNoop } from "../src/woodchopper-sink-noop.strategy";
import { WoodchopperSinkStdoutBuffered } from "../src/woodchopper-sink-stdout-buffered.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.error,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_PLAIN_DATE_TIME,
};

describe("WoodchopperDispatcherSync", () => {
  test("dispatch", () => {
    const sink = new WoodchopperSinkCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(sink.entries[0]).toEqual(entry);
  });

  test("dispatch - error with diagnostics", () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });

    expect(dispatcher.dispatch(entry)).toEqual(false);
    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("dispatch - error without diagnostics", () => {
    const sink = new WoodchopperSinkNoop();
    using _ = spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);
    const dispatcher = new WoodchopperDispatcherSync(sink);

    expect(dispatcher.dispatch(entry)).toEqual(false);
  });

  test("close", () => {
    const sink = new WoodchopperSinkNoop();
    const dispatcher = new WoodchopperDispatcherSync(sink);
    using sinkClose = spyOn(sink, "close");

    expect(() => dispatcher.close()).not.toThrow();
    expect(sinkClose).toHaveBeenCalled();
  });

  test("close - buffered sink", () => {
    const sink = new WoodchopperSinkStdoutBuffered(new WoodchopperFormatterJson());
    const dispatcher = new WoodchopperDispatcherSync(sink);
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());
    using sinkBufferedClose = spyOn(sink, "close");

    dispatcher.dispatch(entry);
    dispatcher.close();

    expect(processStdoutWrite).toHaveBeenCalledWith(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}\n',
    );
    expect(sinkBufferedClose).toHaveBeenCalled();
  });
});
