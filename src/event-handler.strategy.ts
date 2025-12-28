import type { z } from "zod/v4";
import type { GenericEventSchema } from "./event.types";

export interface EventHandlerStrategy {
  handle<T extends { name: z.infer<GenericEventSchema["shape"]["name"]> }>(
    fn: (event: T) => Promise<void>,
  ): (event: T) => Promise<void>;
}
