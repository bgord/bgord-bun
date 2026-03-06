import { describe, expect, jest, test } from "bun:test";
import { CommandBusEmitteryV1Adapter } from "../src/command-bus-emittery-v1.adapter";

type CommandType = { name: "TEST_COMMAND" };
const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusEmitteryV1Adapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new CommandBusEmitteryV1Adapter<CommandType>();

    bus.on("TEST_COMMAND", handler);
    await bus.emit("TEST_COMMAND", command);

    expect(handler).toHaveBeenCalledWith(command);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
