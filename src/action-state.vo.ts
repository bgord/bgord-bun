import type { ActionBlockerType } from "./action-blocker.vo";
import type { TranslationsKeyType } from "./translations-provider.port";

export type ActionState = {
  available: boolean;
  enabled: boolean;
  hints: ReadonlyArray<TranslationsKeyType>;
};

export const ActionState = {
  of(available: boolean, blockers: ReadonlyArray<ActionBlockerType> = []): ActionState {
    const hints = available
      ? blockers.filter((blocker) => !blocker.passes).map((blocker) => blocker.hint)
      : [];

    return { available, enabled: available && hints.length === 0, hints };
  },
};
