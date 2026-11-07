import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

type Handler<Messages extends Message> = (message: Messages) => void | Promise<void>;

export class MessageBusInMemoryAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  private readonly handlers = new Map<PropertyKey, ReadonlyArray<Handler<Messages>>>();

  async emit<E extends Messages>(message: E): Promise<void> {
    const handlers = this.handlers.get(message.name) ?? [];

    await Promise.resolve();

    for (const handler of handlers) await handler(message);
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {
    const handlers = this.handlers.get(name) ?? [];

    this.handlers.set(name, [...handlers, handler as Handler<Messages>]);
  }
}

export const EventBusInMemoryAdapter = MessageBusInMemoryAdapter;
export const CommandBusInMemoryAdapter = MessageBusInMemoryAdapter;
