import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const USER_LANGUAGE_SET_EVENT = "USER_LANGUAGE_SET_EVENT";

export const UserLanguageSetEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(USER_LANGUAGE_SET_EVENT),
  payload: v.object({ userId: UserId, language: tools.Language }),
});

export type UserLanguageSetEventType = v.InferOutput<typeof UserLanguageSetEvent>;
