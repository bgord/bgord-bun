import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const MINUTE_HAS_PASSED_EVENT = "MINUTE_HAS_PASSED_EVENT";

export const MinuteHasPassedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(MINUTE_HAS_PASSED_EVENT),
  payload: v.object({ timestamp: tools.TimestampValue }),
});

export type MinuteHasPassedEventType = v.InferOutput<typeof MinuteHasPassedEvent>;
