import type { Message } from "./message.types";

export interface EventHandlerStrategy {
  handle<Event extends Message>(fn: (event: Event) => Promise<void>): (event: Event) => Promise<void>;
}
