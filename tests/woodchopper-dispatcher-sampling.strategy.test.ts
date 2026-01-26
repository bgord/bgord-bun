import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDiagnosticsCollecting } from "../src/woodchopper-diagnostics-collecting.strategy";
import { WoodchopperDispatcherSampling } from "../src/woodchopper-dispatcher-sampling.strategy";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
import { WoodchopperSinkCollecting } from "../src/woodchopper-sink-collecting.strategy";
import { WoodchopperSinkNoop } from "../src/woodchopper-sink-noop.strategy";
import * as mocks from "./mocks";

const entryInfo = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};
const entryError = { ...entryInfo, level: LogLevelEnum.error };
const entryWarn = { ...entryInfo, level: LogLevelEnum.warn };

const everyTwo = tools.IntegerPositive.parse(2);

describe("WoodchopperDispatcherSampling", () => {
  test("dispatch - every n-th", () => {
    const sink = new WoodchopperSinkCollecting();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);

    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(dispatcher.dispatch(entryInfo)).toEqual(true);
    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(dispatcher.dispatch(entryInfo)).toEqual(true);

    expect(sink.entries).toEqual([entryInfo, entryInfo]);
  });

  test("dispatch - error and warn", () => {
    const sink = new WoodchopperSinkCollecting();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);

    expect(dispatcher.dispatch(entryError)).toEqual(true);
    expect(dispatcher.dispatch(entryWarn)).toEqual(true);
    expect(dispatcher.dispatch(entryError)).toEqual(true);
    expect(dispatcher.dispatch(entryWarn)).toEqual(true);

    expect(sink.entries).toEqual([entryError, entryWarn, entryError, entryWarn]);
  });

  test("dispatch - mixed", () => {
    const sink = new WoodchopperSinkCollecting();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);

    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(dispatcher.dispatch(entryError)).toEqual(true);
    expect(dispatcher.dispatch(entryInfo)).toEqual(true);
    expect(dispatcher.dispatch(entryWarn)).toEqual(true);
    expect(dispatcher.dispatch(entryInfo)).toEqual(false);

    expect(sink.entries).toEqual([entryError, entryInfo, entryWarn]);
  });

  test("dispatch - error - with diagnostics", async () => {
    const diagnostics = new WoodchopperDiagnosticsCollecting();
    const sink = new WoodchopperSinkNoop();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);
    dispatcher.onError = (error) => diagnostics.handle({ kind: "sink", error });
    spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);

    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(diagnostics.entries.length).toEqual(0);
    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(diagnostics.entries.length).toEqual(1);

    expect(diagnostics.entries[0]).toMatchObject({
      kind: "sink",
      error: { message: mocks.IntentionalError },
    });
  });

  test("dispatch - error - without diagnostics", async () => {
    const sink = new WoodchopperSinkNoop();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);
    spyOn(sink, "write").mockImplementation(mocks.throwIntentionalError);

    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
    expect(dispatcher.dispatch(entryInfo)).toEqual(false);
  });

  test("close", () => {
    const sink = new WoodchopperSinkNoop();
    const inner = new WoodchopperDispatcherSync(sink);
    const dispatcher = new WoodchopperDispatcherSampling(inner, everyTwo);
    const innerDispatcherClose = spyOn(inner, "close");

    dispatcher.close();

    expect(innerDispatcherClose).toHaveBeenCalled();
  });
});
