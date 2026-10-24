import type { ImageInfoType } from "../../../image-info.port";
import { Invariant, InvariantFailureKind } from "../../../invariant.service";
import type { ProfileAvatarType } from "../value-objects/profile-avatar";

type Config = { info: ImageInfoType; ProfileAvatar: ProfileAvatarType };

class ProfileAvatarConstraintsError extends Error {}

class ProfileAvatarConstraintsFactory extends Invariant<Config> {
  passes(config: Config) {
    if (config.info.height > config.ProfileAvatar.MaxSide) return false;
    if (config.info.width > config.ProfileAvatar.MaxSide) return false;
    if (config.info.size.isGreaterThan(config.ProfileAvatar.MaxSize)) return false;
    return config.ProfileAvatar.MimeRegistry.hasMime(config.info.mime);
  }

  message = "profile.avatar.constraints";
  kind = InvariantFailureKind.precondition;
  error = ProfileAvatarConstraintsError;
}

export const ProfileAvatarConstraints = new ProfileAvatarConstraintsFactory();
