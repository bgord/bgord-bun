import { describe, expect, jest, test } from "bun:test";
import { CommandBusCollectingAdapter } from "../src/command-bus-collecting.adapter";
import { CommandBusWithLoggerAdapter } from "../src/command-bus-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type CommandType = { name: "TEST_COMMAND" };
const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new CommandBusCollectingAdapter<CommandType>();
    const bus = new CommandBusWithLoggerAdapter<CommandType>(inner, { Logger });

    inner.on("TEST_COMMAND", handler);
    await bus.emit("TEST_COMMAND", command);
    await bus.emit("TEST_COMMAND", command);

    expect(inner.commands).toEqual([command, command]);
    expect(Logger.entries).toEqual([
      {
        message: "TEST_COMMAND emitted",
        component: "infra",
        operation: "command_emitted",
        metadata: command,
      },
      {
        message: "TEST_COMMAND emitted",
        component: "infra",
        operation: "command_emitted",
        metadata: command,
      },
    ]);
    expect(handler).not.toHaveBeenCalled();
  });
});
