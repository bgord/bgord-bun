import { z } from "zod/v4";
import { CommandEnvelopeSchema } from "../../../command-envelope";

export const SET_USER_LANGUAGE_COMMAND = "SET_USER_LANGUAGE_COMMAND";

export const SetUserLanguageCommand = z.object({
  ...CommandEnvelopeSchema,
  name: z.literal(SET_USER_LANGUAGE_COMMAND),
  // TODO: unify
  payload: z.object({ language: z.string().min(1), userId: z.string().min(1) }),
});

export type SetUserLanguageCommandType = z.infer<typeof SetUserLanguageCommand>;
