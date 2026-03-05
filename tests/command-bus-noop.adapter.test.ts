import { describe, expect, jest, test } from "bun:test";
import { CommandBusNoopAdapter } from "../src/command-bus-noop.adapter";

type CommandType = { name: "TEST_COMMAND" };

const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusNoopAdapter", () => {
  test("emit", async () => {
    const bus = new CommandBusNoopAdapter<CommandType>();

    expect(async () => bus.emit("TEST_COMMAND", command)).not.toThrow();
  });

  test("on", async () => {
    const handler = jest.fn();
    const bus = new CommandBusNoopAdapter<CommandType>();

    bus.on("TEST_COMMAND", handler);

    await bus.emit("TEST_COMMAND", command);

    expect(handler).not.toHaveBeenCalled();
  });
});
