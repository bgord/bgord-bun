import { describe, expect, test } from "bun:test";
import { CommandBusCollectingAdapter } from "../src/command-bus-collecting.adapter";
import { CommandBusWithLoggerAdapter } from "../src/command-bus-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type CommandType = { name: "TEST_COMMAND"; payload: { value: number } };

const command: CommandType = { name: "TEST_COMMAND", payload: { value: 42 } };

describe("CommandBusWithLoggerAdapter", () => {
  test("delegates emit to wrapped bus", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new CommandBusCollectingAdapter<CommandType>();
    const bus = new CommandBusWithLoggerAdapter<CommandType>(inner, { Logger });

    await bus.emit("TEST_COMMAND", command);

    expect(inner.commands).toEqual([command]);
    expect(Logger.entries).toEqual([
      {
        message: "TEST_COMMAND emitted",
        component: "infra",
        operation: "command_emitted",
        metadata: command,
      },
    ]);
  });
});
