import { Invariant, InvariantFailureKind } from "../../../invariant.service";

type Config = { current: string | null; candidate: string };

class PreferenceHasChangedError extends Error {}

class PreferenceHasChangedFactory extends Invariant<Config> {
  passes(config: Config) {
    return config.current !== config.candidate;
  }

  message = "preference.has.changed";
  kind = InvariantFailureKind.precondition;
  error = PreferenceHasChangedError;
}

export const PreferenceHasChanged = new PreferenceHasChangedFactory();
