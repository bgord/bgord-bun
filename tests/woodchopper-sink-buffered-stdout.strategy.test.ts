import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperFormatterJson } from "../src/woodchopper-formatter-json.strategy";
import { WoodchopperSinkBufferedStdout } from "../src/woodchopper-sink-buffered-stdout.strategy";
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

describe("WoodchopperSinkStdoutBuffered", () => {
  test("write - buffers within the turn", async () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter);

    sink.write(entry);
    sink.write(entry);

    expect(processStdoutWrite).toHaveBeenCalledTimes(0);

    await mocks.turn();

    expect(processStdoutWrite).toHaveBeenCalledTimes(1);
    expect(processStdoutWrite).toHaveBeenCalledWith(`${output}${output}`);
  });

  test("write - single entry within the turn", async () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter);

    sink.write(entry);
    await mocks.turn();

    expect(processStdoutWrite).toHaveBeenCalledTimes(1);
    expect(processStdoutWrite).toHaveBeenCalledWith(output);
  });

  test("write - two flashes", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter, tools.Int.positive(2));

    sink.write(entry);
    sink.write(entry);
    sink.write(entry);
    sink.write(entry);

    expect(processStdoutWrite).toHaveBeenCalledTimes(2);
    expect(processStdoutWrite).toHaveBeenNthCalledWith(1, `${output}${output}`);
    expect(processStdoutWrite).toHaveBeenNthCalledWith(2, `${output}${output}`);
  });

  test("write - default cap", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter);

    for (let index = 0; index < 255; index++) sink.write(entry);

    expect(processStdoutWrite).toHaveBeenCalledTimes(0);

    sink.write(entry);

    expect(processStdoutWrite).toHaveBeenCalledTimes(1);
    expect(processStdoutWrite).toHaveBeenCalledWith(output.repeat(256));
  });

  test("close - flushes what is left and cancels the scheduled flush", async () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter);

    sink.write(entry);
    sink.close();

    expect(processStdoutWrite).toHaveBeenCalledTimes(1);
    expect(processStdoutWrite).toHaveBeenCalledWith(output);

    await mocks.turn();

    expect(processStdoutWrite).toHaveBeenCalledTimes(1);
  });

  test("close - empty buffer", () => {
    using processStdoutWrite = spyOn(process.stdout, "write").mockImplementation(jest.fn());

    const sink = new WoodchopperSinkBufferedStdout(formatter);

    sink.close();
    sink.close();

    expect(processStdoutWrite).toHaveBeenCalledTimes(0);
  });
});
