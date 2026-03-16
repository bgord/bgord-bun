import * as z from "zod/v4";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UUID } from "../../../uuid.vo";

export const SET_USER_LANGUAGE_COMMAND = "SET_USER_LANGUAGE_COMMAND";

export const SetUserLanguageCommand = z.object({
  ...CommandEnvelopeSchema,
  name: z.literal(SET_USER_LANGUAGE_COMMAND),
  // TODO
  payload: z.object({ language: z.string(), userId: UUID }),
});

export type SetUserLanguageCommandType = z.infer<typeof SetUserLanguageCommand>;
