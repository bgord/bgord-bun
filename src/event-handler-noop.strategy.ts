import type { EventHandlerStrategy } from "./event-handler.strategy";
import type { Message } from "./message.types";

export class EventHandlerNoopStrategy implements EventHandlerStrategy {
  handle<Event extends Message>(_handler: (event: Event) => Promise<void>) {
    return async (_event: Event) => {};
  }
}
