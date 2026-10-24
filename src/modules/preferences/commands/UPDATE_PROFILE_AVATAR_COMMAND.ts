import * as v from "valibot";
import { CommandEnvelopeSchema } from "../../../command-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const UPDATE_PROFILE_AVATAR_COMMAND = "UPDATE_PROFILE_AVATAR_COMMAND";

export const UpdateProfileAvatarCommand = v.object({
  ...CommandEnvelopeSchema,
  name: v.literal(UPDATE_PROFILE_AVATAR_COMMAND),
  payload: v.object({ userId: UserId, absoluteFilePath: v.pipe(v.string(), v.minLength(1)) }),
});

export type UpdateProfileAvatarCommandType = v.InferOutput<typeof UpdateProfileAvatarCommand>;
