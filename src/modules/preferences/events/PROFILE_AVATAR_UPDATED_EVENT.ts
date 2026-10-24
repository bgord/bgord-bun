import * as tools from "@bgord/tools";
import * as v from "valibot";
import { EventEnvelopeSchema } from "../../../event-envelope";
import { HashValue } from "../../../hash-value.vo";
import { UserId } from "../../auth/value-objects/user-id";

export const PROFILE_AVATAR_UPDATED_EVENT = "PROFILE_AVATAR_UPDATED_EVENT";

export const ProfileAvatarUpdatedEvent = v.object({
  ...EventEnvelopeSchema,
  name: v.literal(PROFILE_AVATAR_UPDATED_EVENT),
  payload: v.object({ userId: UserId, key: tools.ObjectKey, etag: HashValue }),
});

export type ProfileAvatarUpdatedEventType = v.InferOutput<typeof ProfileAvatarUpdatedEvent>;
