import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CommandBusEmitteryAdapter } from "../src/command-bus-emittery.adapter";
import { CommandBusWithLoggerAdapter } from "../src/command-bus-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type CommandType = { name: "TEST_COMMAND" };
const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new CommandBusEmitteryAdapter<CommandType>();
    const bus = new CommandBusWithLoggerAdapter<CommandType>(inner, { Logger });

    bus.on("TEST_COMMAND", handler);
    await bus.emit(command);
    await bus.emit(command);

    expect(Logger.entries).toEqual(
      tools.repeat(
        {
          message: "TEST_COMMAND emitted",
          component: "infra",
          operation: "command_emitted",
          metadata: command,
        },
        2,
      ),
    );
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
