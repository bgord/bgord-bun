import * as tools from "@bgord/tools";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { Hash } from "./hash.vo";
import { HashBucket } from "./hash-bucket.vo";

// Stryker disable all
export const AbVariantSelectorError = { NoVariantSelected: "ab.variant.selector.no.variant.selected" };
// Stryker restore all

export class AbVariantSelector {
  constructor(private readonly variants: AbVariants) {}

  select(hash: Hash): AbVariant {
    const bucket = HashBucket.fromHash(hash);

    let cumulative = tools.Int.nonNegative(0);

    for (const variant of this.variants.variants) {
      cumulative = tools.Int.nonNegative(cumulative + variant.config.weight);

      if (bucket.isLessThan(cumulative)) return variant;
    }

    throw new Error(AbVariantSelectorError.NoVariantSelected);
  }
}
