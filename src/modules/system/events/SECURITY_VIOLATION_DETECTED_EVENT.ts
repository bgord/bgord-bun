import * as z from "zod/v4";
import { ClientIp } from "../../../client-ip.vo";
import { ClientUserAgent } from "../../../client-user-agent.vo";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { SecurityCountermeasureName } from "../../../security-countermeasure-name.vo";
import { SecurityRuleName } from "../../../security-rule-name.vo";
import { UUID } from "../../../uuid.vo";

export const SECURITY_VIOLATION_DETECTED_EVENT = "SECURITY_VIOLATION_DETECTED_EVENT";

export const SecurityViolationDetectedEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(SECURITY_VIOLATION_DETECTED_EVENT),
  payload: z.object({
    rule: SecurityRuleName,
    client: z.object({ ip: ClientIp.optional(), ua: ClientUserAgent.optional() }),
    userId: UUID.or(z.undefined()),
    countermeasure: SecurityCountermeasureName,
    action: z.string(),
  }),
});

export type SecurityViolationDetectedEventType = z.infer<typeof SecurityViolationDetectedEvent>;
