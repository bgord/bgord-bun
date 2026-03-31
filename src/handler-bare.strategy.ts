import type { Handleable, HandlerStrategy } from "./handler.strategy";

export class HandlerBareStrategy implements HandlerStrategy {
  handle<H extends Handleable>(handler: (handleable: H) => Promise<void>) {
    return async (handleable: H) => handler(handleable);
  }
}

export const EventHandlerBareStrategy = HandlerBareStrategy;
export const CommandHandlerBareStrategy = HandlerBareStrategy;
