import * as v from "valibot";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const SET_PREFERENCE_COMMAND = "SET_PREFERENCE_COMMAND";

export const SetPreferenceCommand = v.object({
  ...CommandEnvelopeSchema,
  name: v.literal(SET_PREFERENCE_COMMAND),
  payload: v.object({ userId: UserId, preference: v.string(), value: v.string() }),
});

export type SetPreferenceCommandType = v.InferOutput<typeof SetPreferenceCommand>;
