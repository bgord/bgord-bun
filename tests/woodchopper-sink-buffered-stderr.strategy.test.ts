import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
import { WoodchopperSinkBufferedStderr } from "../src/woodchopper-sink-buffered-stderr.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_PLAIN_DATE_TIME,
};

const output =
  '{"app":"woodchopper","component":"infra","environment":"local","level":"info","message":"message","operation":"test","timestamp":"2023-11-14T22:13:20.000Z"}\n';

const formatter = new WoodchopperFormatterJson();

describe("WoodchopperSinkStderrBuffered", () => {
  test("write - buffers within the turn", async () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter);

    sink.write(entry);
    sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledTimes(0);

    await mocks.turn();

    expect(processStderrWrite).toHaveBeenCalledTimes(1);
    expect(processStderrWrite).toHaveBeenCalledWith(`${output}${output}`);
  });

  test("write - single entry within the turn", async () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter);

    sink.write(entry);
    await mocks.turn();

    expect(processStderrWrite).toHaveBeenCalledTimes(1);
    expect(processStderrWrite).toHaveBeenCalledWith(output);
  });

  test("write - two flashes", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter, tools.Int.positive(2));

    sink.write(entry);
    sink.write(entry);
    sink.write(entry);
    sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledTimes(2);
    expect(processStderrWrite).toHaveBeenNthCalledWith(1, `${output}${output}`);
    expect(processStderrWrite).toHaveBeenNthCalledWith(2, `${output}${output}`);
  });

  test("write - default cap", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter);

    for (let index = 0; index < 255; index++) sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledTimes(0);

    sink.write(entry);

    expect(processStderrWrite).toHaveBeenCalledTimes(1);
    expect(processStderrWrite).toHaveBeenCalledWith(output.repeat(256));
  });

  test("close - flushes what is left and cancels the scheduled flush", async () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter);

    sink.write(entry);
    sink.close();

    expect(processStderrWrite).toHaveBeenCalledTimes(1);
    expect(processStderrWrite).toHaveBeenCalledWith(output);

    await mocks.turn();

    expect(processStderrWrite).toHaveBeenCalledTimes(1);
  });

  test("close - empty buffer", () => {
    using processStderrWrite = spyOn(process.stderr, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStderr(formatter);

    sink.close();
    sink.close();

    expect(processStderrWrite).toHaveBeenCalledTimes(0);
  });
});
