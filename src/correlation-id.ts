import { z } from "zod/v4";

import { UUID } from "./uuid";

export const CorrelationId = UUID;

export type CorrelationIdType = z.infer<typeof CorrelationId>;
