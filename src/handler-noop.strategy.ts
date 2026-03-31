import type { Handleable, HandlerStrategy } from "./handler.strategy";

export class HandlerNoopStrategy implements HandlerStrategy {
  handle<H extends Handleable>(_handler: (handleable: H) => Promise<void>) {
    return async (_handleabe: H) => {};
  }
}

export const EventHandlerNoopStrategy = HandlerNoopStrategy;
export const CommandHandlerNoopStrategy = HandlerNoopStrategy;
