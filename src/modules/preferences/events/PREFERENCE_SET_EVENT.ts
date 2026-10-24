import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const PREFERENCE_SET_EVENT = "PREFERENCE_SET_EVENT";

export const PreferenceSetEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(PREFERENCE_SET_EVENT),
  payload: v.object({ userId: UserId, preference: v.string(), value: v.string() }),
});

export type PreferenceSetEventType = v.InferOutput<typeof PreferenceSetEvent>;
