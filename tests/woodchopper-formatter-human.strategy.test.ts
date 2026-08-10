import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterHuman } from "../src/woodchopper-formatter-human.strategy";
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

describe("WoodchopperFormatterHuman", () => {
  test("format", () => {
    expect(new WoodchopperFormatterHuman().format(entry)).toEqualIgnoringWhitespace(
      `{
        "app": "woodchopper",
        "component": "infra",
        "environment": "local",
        "level": "error",
        "message": "message",
        "operation": "test",
        "timestamp": "2023-11-14T22:13:20.000Z"
      }\n`,
    );
  });
});
