import * as v from "valibot";
import { HistoryCreatedAt } from "./history-created-at";
import { HistoryId } from "./history-id";
import { HistoryOperation } from "./history-operation";
import { HistoryPayload, HistoryPayloadParsed } from "./history-payload";
import { HistorySubject } from "./history-subject";

export const History = v.object({
  id: HistoryId,
  operation: HistoryOperation,
  payload: HistoryPayload,
  subject: HistorySubject,
  createdAt: HistoryCreatedAt,
});

export type HistoryType = v.InferOutput<typeof History>;

export const HistoryParsed = v.object({
  id: HistoryId,
  operation: HistoryOperation,
  payload: HistoryPayloadParsed,
  subject: HistorySubject,
  createdAt: HistoryCreatedAt,
});

export type HistoryParsedType = v.InferOutput<typeof HistoryParsed>;
