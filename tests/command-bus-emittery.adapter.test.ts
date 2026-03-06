import { describe, expect, jest, test } from "bun:test";
import { CommandBusEmitteryAdapter } from "../src/command-bus-emittery.adapter";

type CommandType = { name: "TEST_COMMAND" };
const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusEmitteryAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new CommandBusEmitteryAdapter<CommandType>();

    bus.on("TEST_COMMAND", handler);
    await bus.emit(command);

    expect(handler).toHaveBeenCalledWith(command);
  });
});
