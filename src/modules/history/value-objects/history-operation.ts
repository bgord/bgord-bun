import * as v from "valibot";

export const HistoryOperationError = {
  Type: "history.operation.type",
  Empty: "history.operation.empty",
  TooLong: "history.operation.too.long",
};

export const HistoryOperation = v.pipe(
  v.string(HistoryOperationError.Type),
  v.minLength(1, HistoryOperationError.Empty),
  v.maxLength(128, HistoryOperationError.TooLong),
);
