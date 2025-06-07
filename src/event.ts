import { z } from "zod/v4";

import { Logger } from "./logger";
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

export class EventLogger {
  constructor(private readonly logger: Logger) {}

  private _handle(
    type: string,
    _debugName: string,
    eventName: string | undefined,
    eventData: Record<string, any> | undefined,
  ) {
    if (type === "subscribe") return;

    if (typeof eventName === "symbol") return;

    this.logger.info({
      message: `${eventName} emitted`,
      operation: "event_emitted",
      metadata: eventData,
    });
  }

  handle = this._handle.bind(this);
}
