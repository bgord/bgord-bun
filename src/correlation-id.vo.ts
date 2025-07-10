import { z } from "zod";

import { UUID } from "./uuid.vo";

export const CorrelationId = UUID;

export type CorrelationIdType = z.infer<typeof CorrelationId>;
