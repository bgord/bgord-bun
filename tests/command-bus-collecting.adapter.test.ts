import { describe, expect, jest, test } from "bun:test";
import { CommandBusCollectingAdapter } from "../src/command-bus-collecting.adapter";

type CommandType = { name: "TEST_COMMAND" };
const command = { name: "TEST_COMMAND" } as const;

describe("CommandBusCollectingAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new CommandBusCollectingAdapter<CommandType>();

    bus.on("TEST_COMMAND", handler);
    await bus.emit("TEST_COMMAND", command);

    expect(bus.commands).toEqual([command]);
    expect(handler).not.toHaveBeenCalled();
  });
});
