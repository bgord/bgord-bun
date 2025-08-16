import { z } from "zod/v4";
import { HistoryId } from "./history-id";
import { HistoryOperation } from "./history-operation";
import { HistoryPayload, HistoryPayloadParsed } from "./history-payload";
import { HistorySubject } from "./history-subject";

const History = z.object({
  id: HistoryId,
  operation: HistoryOperation,
  payload: HistoryPayload,
  subject: HistorySubject,
});

export type HistoryType = z.infer<typeof History>;

export const HistoryParsed = z.object({
  id: HistoryId,
  operation: HistoryOperation,
  payload: HistoryPayloadParsed,
  subject: HistorySubject,
});

export type HistoryParsedType = z.infer<typeof HistoryParsed>;
