import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { UUID } from "../../../src/uuid.vo";
import * as VO from "../value-objects";

export const HISTORY_POPULATED_EVENT = "HISTORY_POPULATED_EVENT";

export const HistoryPopulatedEvent = z.object({
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
  stream: z.string().min(1),
  name: z.literal(HISTORY_POPULATED_EVENT),
  version: z.literal(1),
  revision: tools.RevisionValue.optional(),
  payload: z.object({
    id: VO.HistoryId,
    operation: VO.HistoryOperation,
    subject: VO.HistorySubject,
    payload: VO.HistoryPayload,
  }),
});
export type HistoryPopulatedEventType = z.infer<typeof HistoryPopulatedEvent>;
