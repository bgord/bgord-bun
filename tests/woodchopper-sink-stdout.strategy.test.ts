import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterHuman } from "../src/woodchopper-formatter-human.strategy";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
import { WoodchopperFormatterJsonRaw } from "../src/woodchopper-formatter-json-raw.strategy";
import { WoodchopperSinkStdout } from "../src/woodchopper-sink-stdout.strategy";
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

describe("WoodchopperSinkStdout", () => {
  test("write - json", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStdout(new WoodchopperFormatterJson()).write(entry);

    expect(processStdoutWrite).toHaveBeenCalledWith(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}\n',
    );
  });

  test("write - json raw", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStdout(new WoodchopperFormatterJsonRaw()).write(entry);

    expect(processStdoutWrite).toHaveBeenCalledWith(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}',
    );
  });

  test("write - human", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStdout(new WoodchopperFormatterHuman()).write(entry);

    expect(processStdoutWrite).toHaveBeenCalledWith(`{
  "app": "woodchopper",
  "component": "infra",
  "environment": "local",
  "level": "error",
  "message": "message",
  "operation": "test",
  "timestamp": "2023-11-14T22:13:20.000Z"
}\n`);
  });
});
