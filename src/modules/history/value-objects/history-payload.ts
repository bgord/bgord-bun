import * as z from "zod/v4";

export const HistoryPayload = z.record(z.string(), z.any());

export const HistoryPayloadParsedError = {
  NotSerializable: "history.payload.parsed.not.serializable",
};

export const HistoryPayloadParsed = HistoryPayload.transform((value) => {
  try {
    return JSON.stringify(value);
  } catch {
    throw new Error(HistoryPayloadParsedError.NotSerializable);
  }
});
