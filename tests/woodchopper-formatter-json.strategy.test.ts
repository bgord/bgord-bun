import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
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

describe("WoodchopperFormatterJson", () => {
  test("format", () => {
    expect(new WoodchopperFormatterJson().format(entry)).toEqual(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}\n',
    );
  });
});
