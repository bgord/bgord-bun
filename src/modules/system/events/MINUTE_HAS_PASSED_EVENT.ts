import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const MINUTE_HAS_PASSED_EVENT = "MINUTE_HAS_PASSED_EVENT";

export const MinuteHasPassedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(MINUTE_HAS_PASSED_EVENT),
  payload: z.object({ timestamp: tools.TimestampValue }),
});

export type MinuteHasPassedEventType = z.infer<typeof MinuteHasPassedEvent>;
