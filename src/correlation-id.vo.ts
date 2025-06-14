import { z } from "zod/v4";

import { UUID } from "./uuid.vo";

export const CorrelationId = UUID.brand("CorrelationId");

export type CorrelationIdType = z.infer<typeof CorrelationId>;
