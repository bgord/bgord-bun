import type { Invariant } from "./invariant.service";
import type { TranslationsKeyType } from "./translations-provider.port";

export type ActionBlockerType = { passes: boolean; hint: TranslationsKeyType };

export const ActionBlocker = {
  from<T extends Record<string, unknown>>(invariant: Invariant<T>, config: T): ActionBlockerType {
    return { passes: invariant.passes(config), hint: invariant.message };
  },
};
