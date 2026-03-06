import type { EventHandlerStrategy } from "./event-handler.strategy";

export class EventHandlerBareStrategy implements EventHandlerStrategy {
  handle<T extends { name: string }>(fn: (event: T) => Promise<void>) {
    return async (event: T) => fn(event);
  }
}
