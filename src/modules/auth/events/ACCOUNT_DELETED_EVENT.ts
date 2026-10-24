import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UserId } from "../value-objects/user-id";

export const ACCOUNT_DELETED_EVENT = "ACCOUNT_DELETED_EVENT";

export const AccountDeletedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(ACCOUNT_DELETED_EVENT),
  payload: v.object({ userId: UserId, timestamp: tools.TimestampValue }),
});

export type AccountDeletedEventType = v.InferOutput<typeof AccountDeletedEvent>;
