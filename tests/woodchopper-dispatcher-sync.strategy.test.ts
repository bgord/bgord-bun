import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDispatcherSync } from "../src/woodchopper-dispatcher-sync.strategy";
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

const sink = new WoodchopperSinkNoop();
const dispatcher = new WoodchopperDispatcherSync(sink);

describe("WoodchopperDispatcherSync", () => {
  test("dispatch", () => {
    expect(dispatcher.dispatch(entry)).toEqual(true);
    expect(sink.entries[0]).toEqual(entry);
  });

  test("close", () => {
    expect(() => dispatcher.close()).not.toThrow();
  });
});
