import { z } from "zod/v4";

import { UUID } from "./uuid";

export const Event = z.object({
  id: UUID,
  createdAt: z.date(),

  stream: z.string().min(1),

  name: z.string().min(1),
  version: z.number().int().positive(),
  payload: z
    .record(z.string(), z.any())
    .refine((value) => {
      try {
        JSON.parse(String(value));
        return true;
      } catch (error) {
        return false;
      }
    })
    .transform((value) => JSON.stringify(value)),
});

export const ParsedEvent = Event.merge(z.object({ payload: z.record(z.string(), z.any()) }));

export type EventType = z.infer<typeof Event>;
export type ParsedEventType = z.infer<typeof ParsedEvent>;
