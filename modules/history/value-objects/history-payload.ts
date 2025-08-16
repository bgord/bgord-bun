import { z } from "zod/v4";

export const HistoryPayload = z.record(z.string(), z.any());

export const HistoryPayloadParsed = HistoryPayload.refine((value) => {
  try {
    JSON.parse(JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}).transform((value) => JSON.stringify(value));
