import * as v from "valibot";
import { UUID } from "../../../uuid.vo";

// Stryker disable next-line StringLiteral
export const HistoryId = v.pipe(UUID, v.brand("HistoryId"));

export type HistoryIdType = v.InferOutput<typeof HistoryId>;
