import type * as tools from "@bgord/tools";
import type { UserIdType } from "../../auth/value-objects/user-id";

export type ProfileAvatarType = {
  MaxSide: tools.ImageWidthType;
  MaxSize: tools.Size;
  MimeRegistry: tools.MimeRegistry;
  Side: tools.ImageWidthType;
  key(userId: UserIdType): tools.ObjectKeyType;
};
