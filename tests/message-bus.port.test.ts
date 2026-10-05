import { describe, expect, test } from "bun:test";
import type { CommandBusPort, EventBusPort, MessageBusPort } from "../src/message-bus.port";
import { MessageBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import type * as mocks from "./mocks";

describe("MessageBusPort", () => {
  test("variance - narrower message union", () => {
    const bus: MessageBusPort<mocks.MessageType | mocks.AnotherMessageType> = new MessageBusCollectingAdapter<
      mocks.MessageType | mocks.AnotherMessageType
    >();

    const narrowed: MessageBusPort<mocks.MessageType> = bus;

    expect<unknown>(narrowed).toBe(bus);
  });

  test("variance - message outside union", () => {
    const bus: MessageBusPort<mocks.MessageType> = new MessageBusCollectingAdapter<mocks.MessageType>();

    // @ts-expect-error AnotherMessageType is not in the bus's union
    const widened: MessageBusPort<mocks.MessageType | mocks.AnotherMessageType> = bus;

    expect<unknown>(widened).toBe(bus);
  });

  test("variance - EventBusPort - message outside union", () => {
    const EventBus: EventBusPort<mocks.MessageType> = new MessageBusCollectingAdapter<mocks.MessageType>();

    // @ts-expect-error AnotherMessageType is not in the bus's union
    const widened: EventBusPort<mocks.MessageType | mocks.AnotherMessageType> = EventBus;

    expect<unknown>(widened).toBe(EventBus);
  });

  test("variance - CommandBusPort - message outside union", () => {
    const CommandBus: CommandBusPort<mocks.MessageType> =
      new MessageBusCollectingAdapter<mocks.MessageType>();

    // @ts-expect-error AnotherMessageType is not in the bus's union
    const widened: CommandBusPort<mocks.MessageType | mocks.AnotherMessageType> = CommandBus;

    expect<unknown>(widened).toBe(CommandBus);
  });

  test("variance - adapter - message outside union", () => {
    const bus = new MessageBusCollectingAdapter<mocks.MessageType>();

    // @ts-expect-error AnotherMessageType is not in the bus's union
    const widened: MessageBusPort<mocks.MessageType | mocks.AnotherMessageType> = bus;

    expect<unknown>(widened).toBe(bus);
  });
});
