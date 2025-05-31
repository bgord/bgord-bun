import { z } from "zod/v4";

import { UUID } from "./uuid";

export const CorrelationId = UUID.brand<"correlation-id">();
export type CorrelationIdType = z.infer<typeof CorrelationId>;
