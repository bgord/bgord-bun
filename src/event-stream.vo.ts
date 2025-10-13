import { z } from "zod/v4";

export const EventStreamInvalidError = { error: "event.stream.invalid.error" } as const;

export const EventStream = z
  .string(EventStreamInvalidError)
  .min(1, EventStreamInvalidError)
  .max(256, EventStreamInvalidError);

export type EventStreamType = z.infer<typeof EventStream>;
