import type * as tools from "@bgord/tools";
import { Invariant, InvariantFailureKind } from "../../../invariant.service";

type Config = { current?: tools.LanguageType | null; candidate: tools.LanguageType };

class UserLanguageHasChangedError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UserLanguageHasChangedError.prototype);
  }
}

class UserLanguageHasChangedFactory extends Invariant<Config> {
  passes(config: Config) {
    return config.current !== config.candidate;
  }

  message = "user.language.has.changed";
  kind = InvariantFailureKind.precondition;
  error = UserLanguageHasChangedError;
}

export const UserLanguageHasChanged = new UserLanguageHasChangedFactory();
