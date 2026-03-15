import type { Message } from "./message.types";

export interface MessageHandlerStrategy {
  handle<M extends Message>(handler: (message: M) => Promise<void>): (message: M) => Promise<void>;
}

export type EventHandlerStrategy = MessageHandlerStrategy;
export type CommandHandlerStrategy = MessageHandlerStrategy;
