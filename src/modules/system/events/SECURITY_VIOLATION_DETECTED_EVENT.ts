import * as v from "valibot";
import { ClientIp } from "../../../client-ip.vo";
import { ClientUserAgent } from "../../../client-user-agent.vo";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { SecurityCountermeasureName } from "../../../security-countermeasure-name.vo";
import { SecurityRuleName } from "../../../security-rule-name.vo";
import { UUID } from "../../../uuid.vo";

export const SECURITY_VIOLATION_DETECTED_EVENT = "SECURITY_VIOLATION_DETECTED_EVENT";

export const SecurityViolationDetectedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(SECURITY_VIOLATION_DETECTED_EVENT),
  payload: v.object({
    rule: SecurityRuleName,
    client: v.object({ ip: v.optional(ClientIp), ua: v.optional(ClientUserAgent) }),
    userId: v.optional(UUID),
    countermeasure: SecurityCountermeasureName,
    action: v.string(),
  }),
});

export type SecurityViolationDetectedEventType = v.InferOutput<typeof SecurityViolationDetectedEvent>;
