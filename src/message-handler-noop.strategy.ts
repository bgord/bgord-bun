import type { Message } from "./message.types";
import type { MessageHandlerStrategy } from "./message-handler.strategy";

export class MessageHandlerNoopStrategy implements MessageHandlerStrategy {
  handle<M extends Message>(_handler: (message: M) => Promise<void>) {
    return async (_message: M) => {};
  }
}

export type EventHandlerNoopStrategy = MessageHandlerNoopStrategy;
export type CommandHandlerNoopStrategy = MessageHandlerNoopStrategy;
