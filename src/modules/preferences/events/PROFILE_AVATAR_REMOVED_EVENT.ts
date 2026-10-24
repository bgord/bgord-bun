import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { UserId } from "../../auth/value-objects/user-id";

export const PROFILE_AVATAR_REMOVED_EVENT = "PROFILE_AVATAR_REMOVED_EVENT";

export const ProfileAvatarRemovedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(PROFILE_AVATAR_REMOVED_EVENT),
  payload: v.object({ userId: UserId }),
});

export type ProfileAvatarRemovedEventType = v.InferOutput<typeof ProfileAvatarRemovedEvent>;
