import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UserId } from "../value-objects/user-id";

export const ACCOUNT_CREATED_EVENT = "ACCOUNT_CREATED_EVENT";

export const AccountCreatedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(ACCOUNT_CREATED_EVENT),
  payload: v.object({ userId: UserId, timestamp: tools.TimestampValue }),
});

export type AccountCreatedEventType = v.InferOutput<typeof AccountCreatedEvent>;
