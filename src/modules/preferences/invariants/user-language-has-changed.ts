import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Invariant } from "../../../invariant.service";

class UserLanguageHasChangedError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UserLanguageHasChangedError.prototype);
  }
}

type UserLanguageHasChangedConfigType = { current?: string | null; candidate: string };

class UserLanguageHasChangedFactory extends Invariant<UserLanguageHasChangedConfigType> {
  fails(config: UserLanguageHasChangedConfigType) {
    if (!config.current) return false;
    return config.current === config.candidate;
  }

  message = "UserLanguageHasChanged";

  error = UserLanguageHasChangedError;

  code = 403 as ContentfulStatusCode;
}

export const UserLanguageHasChanged = new UserLanguageHasChangedFactory();
