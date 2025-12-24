import { z } from "zod/v4";
import { ClientIp } from "../../../client-ip.vo";
import { ClientUserAgent } from "../../../client-user-agent.vo";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UUID } from "../../../uuid.vo";

export const SECURITY_VIOLATION_DETECTED_EVENT = "SECURITY_VIOLATION_DETECTED_EVENT";

export const SecurityViolationDetectedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(SECURITY_VIOLATION_DETECTED_EVENT),
  payload: z.object({
    rule: z.string(),
    client: z.object({ ip: ClientIp, ua: ClientUserAgent }),
    userId: UUID.or(z.undefined()),
    countermeasure: z.string(),
    action: z.string(),
  }),
});

export type SecurityViolationDetectedEventType = z.infer<typeof SecurityViolationDetectedEvent>;
