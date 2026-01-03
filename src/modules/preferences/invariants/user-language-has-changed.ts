import type * as tools from "@bgord/tools";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Invariant } from "../../../invariant.service";

class UserLanguageHasChangedError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UserLanguageHasChangedError.prototype);
  }
}

type UserLanguageHasChangedConfigType = {
  current?: tools.LanguageType | null;
  candidate: tools.LanguageType;
};

class UserLanguageHasChangedFactory extends Invariant<UserLanguageHasChangedConfigType> {
  fails(config: UserLanguageHasChangedConfigType) {
    return config.current === config.candidate;
  }

  message = "UserLanguageHasChanged";
  error = UserLanguageHasChangedError;
  code = 403 as ContentfulStatusCode;
}

export const UserLanguageHasChanged = new UserLanguageHasChangedFactory();
