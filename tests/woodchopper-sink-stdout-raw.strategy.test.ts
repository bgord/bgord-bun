import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSinkStdoutRaw } from "../src/woodchopper-sink-stdout-raw.strategy";
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

describe("WoodchopperSinkStdoutRaw", () => {
  test("write", () => {
    const processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());
    const sink = new WoodchopperSinkStdoutRaw();

    sink.write(entry);

    expect(processStdoutWrite).toHaveBeenCalledWith(JSON.stringify(entry));
  });
});
