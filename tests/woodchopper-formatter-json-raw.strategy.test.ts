import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterJsonRaw } from "../src/woodchopper-formatter-json-raw.strategy";
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

describe("WoodchopperFormatterJsonRaw", () => {
  test("format", () => {
    expect(new WoodchopperFormatterJsonRaw().format(entry)).toEqual(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}',
    );
  });
});
