import { z } from "zod/v4";

export const HistoryOperation = z.string().min(1).max(128).trim();
