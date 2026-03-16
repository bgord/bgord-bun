import * as z from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const MINUTE_HAS_PASSED_EVENT = "MINUTE_HAS_PASSED_EVENT";

export const MinuteHasPassedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(MINUTE_HAS_PASSED_EVENT),
  // TODO
  payload: z.object({ timestamp: z.number() }),
});

export type MinuteHasPassedEventType = z.infer<typeof MinuteHasPassedEvent>;
