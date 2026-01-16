import * as z from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";
import * as VO from "../value-objects";

export const HISTORY_POPULATED_EVENT = "HISTORY_POPULATED_EVENT";

export const HistoryPopulatedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(HISTORY_POPULATED_EVENT),
  payload: z.object({
    id: VO.HistoryId,
    operation: VO.HistoryOperation,
    subject: VO.HistorySubject,
    payload: VO.HistoryPayload,
  }),
});
export type HistoryPopulatedEventType = z.infer<typeof HistoryPopulatedEvent>;
