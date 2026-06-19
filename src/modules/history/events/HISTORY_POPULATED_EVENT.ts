import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import * as VO from "../value-objects";

export const HISTORY_POPULATED_EVENT = "HISTORY_POPULATED_EVENT";

export const HistoryPopulatedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(HISTORY_POPULATED_EVENT),
  payload: v.object({
    id: VO.HistoryId,
    operation: VO.HistoryOperation,
    subject: VO.HistorySubject,
    payload: VO.HistoryPayload,
  }),
});
export type HistoryPopulatedEventType = v.InferOutput<typeof HistoryPopulatedEvent>;
