import type * as tools from "@bgord/tools";
import { Invariant, InvariantFailureKind } from "../../../invariant.service";

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
  passes(config: UserLanguageHasChangedConfigType) {
    return config.current !== config.candidate;
  }

  message = "user.language.has.changed";
  kind = InvariantFailureKind.precondition;
  error = UserLanguageHasChangedError;
}

export const UserLanguageHasChanged = new UserLanguageHasChangedFactory();
