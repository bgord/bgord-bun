import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const SET_USER_LANGUAGE_COMMAND = "SET_USER_LANGUAGE_COMMAND";

export const SetUserLanguageCommand = v.object({
  ...CommandEnvelopeSchema,
  name: v.literal(SET_USER_LANGUAGE_COMMAND),
  payload: v.object({ language: tools.Language, userId: UserId }),
});

export type SetUserLanguageCommandType = v.InferOutput<typeof SetUserLanguageCommand>;
