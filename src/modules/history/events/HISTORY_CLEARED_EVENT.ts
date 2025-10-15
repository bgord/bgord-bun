import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";
import * as VO from "../value-objects";

export const HISTORY_CLEARED_EVENT = "HISTORY_CLEARED_EVENT";

export const HistoryClearedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(HISTORY_CLEARED_EVENT),
  payload: z.object({ subject: VO.HistorySubject }),
});

export type HistoryClearedEventType = z.infer<typeof HistoryClearedEvent>;
