import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSinkStderr } from "../src/woodchopper-sink-stderr.strategy";
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

describe("WoodchopperSinkStderr", () => {
  test("write", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());
    const sink = new WoodchopperSinkStderr();

    sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledWith(JSON.stringify(entry) + "\n");
  });
});
