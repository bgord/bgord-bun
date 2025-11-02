import * as tools from "@bgord/tools";
import type { z } from "zod/v4";

export const HistoryCreatedAt = tools.TimestampValue;

export type HistoryCreatedAtType = z.infer<typeof HistoryCreatedAt>;
