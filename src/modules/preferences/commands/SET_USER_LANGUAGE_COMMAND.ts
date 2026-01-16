import * as tools from "@bgord/tools";
import * as z from "zod/v4";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UUID } from "../../../uuid.vo";

export const SET_USER_LANGUAGE_COMMAND = "SET_USER_LANGUAGE_COMMAND";

export const SetUserLanguageCommand = z.object({
  ...CommandEnvelopeSchema,
  name: z.literal(SET_USER_LANGUAGE_COMMAND),
  payload: z.object({ language: tools.Language, userId: UUID }),
});

export type SetUserLanguageCommandType = z.infer<typeof SetUserLanguageCommand>;
