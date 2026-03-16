import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const HOUR_HAS_PASSED_EVENT = "HOUR_HAS_PASSED_EVENT";

export const HourHasPassedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(HOUR_HAS_PASSED_EVENT),
  payload: v.object({ timestamp: tools.TimestampValue }),
});

export type HourHasPassedEventType = v.InferOutput<typeof HourHasPassedEvent>;
