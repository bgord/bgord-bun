import { z } from "zod/v4";

export const HistorySubjectError = {
  Type: "history.subject.type",
  Empty: "history.subject.empty",
  TooLong: "history.subject.too.long",
};

export const HistorySubject = z
  .string(HistorySubjectError.Type)
  .min(1, HistorySubjectError.Empty)
  .max(128, HistorySubjectError.TooLong);

export type HistorySubjectType = z.infer<typeof HistorySubject>;
