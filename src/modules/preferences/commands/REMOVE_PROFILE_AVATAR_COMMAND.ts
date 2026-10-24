import * as v from "valibot";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const REMOVE_PROFILE_AVATAR_COMMAND = "REMOVE_PROFILE_AVATAR_COMMAND";

export const RemoveProfileAvatarCommand = v.object({
  ...CommandEnvelopeSchema,
  name: v.literal(REMOVE_PROFILE_AVATAR_COMMAND),
  payload: v.object({ userId: UserId }),
});

export type RemoveProfileAvatarCommandType = v.InferOutput<typeof RemoveProfileAvatarCommand>;
