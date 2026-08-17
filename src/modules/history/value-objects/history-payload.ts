import * as v from "valibot";

export const HistoryPayload = v.pipe(
  v.record(v.string(), v.unknown()),
  // Stryker disable next-line StringLiteral
  v.brand("HistoryPayload"),
);

export type HistoryPayloadType = v.InferOutput<typeof HistoryPayload>;

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
  // Stryker disable next-line StringLiteral
  v.brand("HistoryPayloadParsed"),
);

export type HistoryPayloadParsedType = v.InferOutput<typeof HistoryPayloadParsed>;
