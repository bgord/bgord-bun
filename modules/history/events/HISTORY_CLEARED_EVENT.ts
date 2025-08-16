import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { UUID } from "../../../src/uuid.vo";
import * as VO from "../value-objects";

export const HISTORY_CLEARED_EVENT = "HISTORY_CLEARED_EVENT";

export const HistoryClearedEvent = z.object({
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
  stream: z.string().min(1),
  name: z.literal(HISTORY_CLEARED_EVENT),
  version: z.literal(1),
  revision: tools.RevisionValue.optional(),
  payload: z.object({ subject: VO.HistorySubject }),
});

export type HistoryClearedEventType = z.infer<typeof HistoryClearedEvent>;
