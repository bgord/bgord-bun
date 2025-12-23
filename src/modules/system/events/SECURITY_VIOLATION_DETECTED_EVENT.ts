import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const SECURITY_VIOLATION_DETECTED_EVENT = "SECURITY_VIOLATION_DETECTED_EVENT";

export const SecurityViolationDetectedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(SECURITY_VIOLATION_DETECTED_EVENT),
  payload: z.object({ client: z.object({ ip: z.string(), ua: z.string() }) }),
});

export type SecurityViolationDetectedEventType = z.infer<typeof SecurityViolationDetectedEvent>;
