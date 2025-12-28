import type { z } from "zod/v4";
import type { GenericEventSchema } from "./event.types";
import type { EventHandlerStrategy } from "./event-handler.strategy";

export class EventHandlerNoopStrategy implements EventHandlerStrategy {
  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(_fn: (event: T) => Promise<void>) {
    return async (_event: T) => {};
  }
}
