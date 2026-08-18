import * as v from "valibot";
import { UUID } from "./uuid.vo";

// Stryker disable next-line StringLiteral
export const CorrelationId = v.pipe(UUID, v.brand("CorrelationId"));

export type CorrelationIdType = v.InferOutput<typeof CorrelationId>;
