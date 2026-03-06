import type { EventHandlerStrategy } from "./event-handler.strategy";

export class EventHandlerNoopStrategy implements EventHandlerStrategy {
  handle<T extends { name: string }>(_fn: (event: T) => Promise<void>) {
    return async (_event: T) => {};
  }
}
