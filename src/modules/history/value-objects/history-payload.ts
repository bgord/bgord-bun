import * as v from "valibot";

export const HistoryPayload = v.record(v.string(), v.unknown());

export const HistoryPayloadParsedError = {
  NotSerializable: "history.payload.parsed.not.serializable",
};

// Stryker disable BlockStatement
export const HistoryPayloadParsed = v.pipe(
  HistoryPayload,
  v.check((value) => {
    try {
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  }, HistoryPayloadParsedError.NotSerializable),
  v.transform((value) => JSON.stringify(value)),
);
