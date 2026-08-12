import * as v from "valibot";
import { UUID } from "./uuid.vo";

export const CorrelationId = v.pipe(UUID, v.brand("CorrelationId"));

export type CorrelationIdType = v.InferOutput<typeof CorrelationId>;
