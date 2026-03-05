import { describe, expect, jest, test } from "bun:test";
import { CommandBusEmitteryV1Adapter } from "../src/command-bus-emittery-v1.adapter";

type CommandType = { name: "TEST_COMMAND"; payload: { value: number } };

const command: CommandType = { name: "TEST_COMMAND", payload: { value: 42 } };

describe("CommandBusEmitteryV1Adapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new CommandBusEmitteryV1Adapter<CommandType>();
    bus.on("TEST_COMMAND", handler);

    await bus.emit("TEST_COMMAND", command);

    expect(handler).toHaveBeenCalledWith(command);
  });

  test("multiple handlers", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const bus = new CommandBusEmitteryV1Adapter<CommandType>();
    bus.on("TEST_COMMAND", first);
    bus.on("TEST_COMMAND", second);

    await bus.emit("TEST_COMMAND", command);

    expect(first).toHaveBeenCalledWith(command);
    expect(second).toHaveBeenCalledWith(command);
  });
});
