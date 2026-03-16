import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import * as VO from "../value-objects";

export const HISTORY_CLEARED_EVENT = "HISTORY_CLEARED_EVENT";

export const HistoryClearedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(HISTORY_CLEARED_EVENT),
  payload: v.object({ subject: VO.HistorySubject }),
});

export type HistoryClearedEventType = v.InferOutput<typeof HistoryClearedEvent>;
