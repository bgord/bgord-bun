import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperDispatcherNoop } from "../src/woodchopper-dispatcher-noop.strategy";
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

const dispatcher = new WoodchopperDispatcherNoop();

describe("WoodchopperDispatcherNoop", () => {
  test("dispatch", () => {
    expect(dispatcher.dispatch(entry)).toEqual(true);
  });

  test("close", () => {
    expect(() => dispatcher.close()).not.toThrow();
  });
});
