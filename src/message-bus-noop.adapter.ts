import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

export class MessageBusNoopAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  async emit<M extends Messages>(_message: M): Promise<void> {}

  on<MessageName extends keyof ToMessageMap<Messages>>(
    _name: MessageName,
    _handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {}
}

export const EventBusNoopAdapter = MessageBusNoopAdapter;
export const CommandBusNoopAdapter = MessageBusNoopAdapter;
