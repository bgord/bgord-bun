import type { EventHandlerStrategy } from "./event-handler.strategy";
import type { Message } from "./message.types";

export class EventHandlerBareStrategy implements EventHandlerStrategy {
  handle<Event extends Message>(handler: (event: Event) => Promise<void>) {
    return async (event: Event) => handler(event);
  }
}
