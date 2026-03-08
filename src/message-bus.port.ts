import type { Message, ToMessageMap } from "./message.types";

export interface MessageBusPort<Messages extends Message> {
  emit<M extends Messages>(message: M): Promise<void>;

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (event: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void;
}

export type EventBusPort<Event extends Message> = MessageBusPort<Event>;

export type CommandBusPort<Command extends Message> = MessageBusPort<Command>;
