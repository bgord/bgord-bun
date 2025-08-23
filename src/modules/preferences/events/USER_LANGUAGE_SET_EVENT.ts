import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";

export const USER_LANGUAGE_SET_EVENT = "USER_LANGUAGE_SET_EVENT";

export const UserLanguageSetEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(USER_LANGUAGE_SET_EVENT),
  // TODO: unify
  payload: z.object({ userId: z.string().min(1), language: z.string().min(1) }),
});

export type UserLanguageSetEventType = z.infer<typeof UserLanguageSetEvent>;
