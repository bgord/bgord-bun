import * as tools from "@bgord/tools";
import type * as z from "zod/v4";

export const HistoryCreatedAt = tools.TimestampValue;

export type HistoryCreatedAtType = z.infer<typeof HistoryCreatedAt>;
