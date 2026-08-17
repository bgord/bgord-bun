import * as v from "valibot";

export const HistorySubjectError = {
  Type: "history.subject.type",
  Empty: "history.subject.empty",
  TooLong: "history.subject.too.long",
};

export const HistorySubject = v.pipe(
  v.string(HistorySubjectError.Type),
  v.minLength(1, HistorySubjectError.Empty),
  v.maxLength(128, HistorySubjectError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("HistorySubject"),
);

export type HistorySubjectType = v.InferOutput<typeof HistorySubject>;
