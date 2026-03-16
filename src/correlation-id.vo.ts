import type * as v from "valibot";
import { UUID } from "./uuid.vo";

export const CorrelationId = UUID;

export type CorrelationIdType = v.InferOutput<typeof CorrelationId>;
