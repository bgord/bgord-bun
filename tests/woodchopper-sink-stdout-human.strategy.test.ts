import { describe, expect, jest, spyOn, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSinkStdoutHuman } from "../src/woodchopper-sink-stdout-human.strategy";
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

describe("WoodchopperSinkStdoutHuman", () => {
  test("write", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    new WoodchopperSinkStdoutHuman().write(entry);

    expect(processStdoutWrite).toHaveBeenCalledWith(JSON.stringify(entry, null, 2) + "\n");
  });
});
