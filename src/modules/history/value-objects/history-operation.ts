import { z } from "zod/v4";

export const HistoryOperationError = {
  Type: "history.operation.type",
  Empty: "history.operation.empty",
  TooLong: "history.operation.too.long",
};

export const HistoryOperation = z
  .string(HistoryOperationError.Type)
  .min(1, HistoryOperationError.Empty)
  .max(128, HistoryOperationError.TooLong);
