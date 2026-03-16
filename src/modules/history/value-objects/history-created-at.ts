import * as tools from "@bgord/tools";
import type * as v from "valibot";

export const HistoryCreatedAt = tools.TimestampValue;

export type HistoryCreatedAtType = v.InferOutput<typeof HistoryCreatedAt>;
