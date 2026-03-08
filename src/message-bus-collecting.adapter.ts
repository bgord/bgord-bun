import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

export class MessageBusCollectingAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  public messages: Array<Messages> = [];

  async emit<M extends Messages>(message: M): Promise<void> {
    this.messages.push(message);
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    _name: MessageName,
    _handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {}
}

export const EventBusCollectingAdapter = MessageBusCollectingAdapter;
export const CommandBusCollectingAdapter = MessageBusCollectingAdapter;
