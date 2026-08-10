import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
import { WoodchopperFormatterJsonRaw } from "../src/woodchopper-formatter-json-raw.strategy";
import { WoodchopperSinkStderr } from "../src/woodchopper-sink-stderr.strategy";
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

describe("WoodchopperSinkStderr", () => {
  test("write - json", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStderr(new WoodchopperFormatterJson()).write(entry);

    expect(processStderrWrite).toHaveBeenCalledWith(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}\n',
    );
  });

  test("write - json raw", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStderr(new WoodchopperFormatterJsonRaw()).write(entry);

    expect(processStderrWrite).toHaveBeenCalledWith(
      '{"app":"woodchopper","component":"infra","environment":"local","level":"error","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}',
    );
  });
});
