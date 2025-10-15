import { z } from "zod/v4";

export const EventStreamError = {
  Type: "event.store.type",
  Empty: "event.stream.empty",
  TooLong: "event.stream.too.long",
} as const;

export const EventStream = z
  .string(EventStreamError.Type)
  .min(1, EventStreamError.Empty)
  .max(256, EventStreamError.TooLong);

export type EventStreamType = z.infer<typeof EventStream>;
