import type { Message } from "./message.types";
import type { MessageHandlerStrategy } from "./message-handler.strategy";

export class MessageHandlerBareStrategy implements MessageHandlerStrategy {
  handle<M extends Message>(handler: (message: M) => Promise<void>) {
    return async (message: M) => handler(message);
  }
}

export type EventHandlerBareStrategy = MessageHandlerBareStrategy;
export type CommandHandlerBareStrategy = MessageHandlerBareStrategy;
