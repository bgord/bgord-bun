import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodChopperSinkStderr } from "../src/woodchopper-sink-stderr.strategy";
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

describe("WoodChopperSinkStderr", () => {
  test("write", () => {
    const processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());
    const sink = new WoodChopperSinkStderr();

    sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledWith(JSON.stringify(entry));
  });
});
