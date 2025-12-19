import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const HOUR_HAS_PASSED_EVENT = "HOUR_HAS_PASSED_EVENT";

export const HourHasPassedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(HOUR_HAS_PASSED_EVENT),
  payload: z.object({ timestamp: tools.TimestampValue }),
});

export type HourHasPassedEventType = z.infer<typeof HourHasPassedEvent>;
