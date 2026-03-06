import type { EventHandlerStrategy } from "./event-handler.strategy";
import type { Message } from "./message.types";

export class EventHandlerBareStrategy implements EventHandlerStrategy {
  handle<Event extends Message>(fn: (event: Event) => Promise<void>) {
    return async (event: Event) => fn(event);
  }
}
