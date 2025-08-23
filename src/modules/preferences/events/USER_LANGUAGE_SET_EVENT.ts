import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UUID } from "../../../uuid.vo";

export const USER_LANGUAGE_SET_EVENT = "USER_LANGUAGE_SET_EVENT";

export const UserLanguageSetEvent = z.object({
  ...EventEnvelopeSchema,
  name: z.literal(USER_LANGUAGE_SET_EVENT),
  payload: z.object({ userId: UUID, language: tools.Language }),
});

export type UserLanguageSetEventType = z.infer<typeof UserLanguageSetEvent>;
