import type { Handleable, HandlerStrategy } from "./handler.strategy";

export class HandlerNoopStrategy implements HandlerStrategy {
  handle<H extends Handleable>(_handler: (handleable: H) => Promise<void>) {
    return async (_handleable: H) => {};
  }
}

export const EventHandlerNoopStrategy = HandlerNoopStrategy;
export const CommandHandlerNoopStrategy = HandlerNoopStrategy;
export const JobHandlerNoopStrategy = HandlerNoopStrategy;
