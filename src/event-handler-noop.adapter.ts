import type { z } from "zod/v4";
import type { GenericEventSchema } from "./event.types";
import type { EventHandlerPort } from "./event-handler.port";

export class EventHandlerNoopAdapter implements EventHandlerPort {
  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(_fn: (event: T) => Promise<void>) {
    return async (_event: T) => {};
  }
}
