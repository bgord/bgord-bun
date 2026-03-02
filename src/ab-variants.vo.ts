import * as tools from "@bgord/tools";
import type { AbVariant } from "./ab-variant.vo";

export const AbVariantsError = {
  Min: "ab.variants.min",
  Max: "ab.variants.max",
  UniqueNames: "ab.variants.unique.names",
  Sum: "ab.variants.sum",
};

export class AbVariants {
  constructor(readonly variants: ReadonlyArray<AbVariant>) {
    if (variants.length <= 1) throw new Error(AbVariantsError.Min);
    if (variants.length > 5) throw new Error(AbVariantsError.Max);

    const uniqueNames = new Set(variants.map((variant) => variant.config.name));

    if (uniqueNames.size !== variants.length) throw new Error(AbVariantsError.UniqueNames);

    const sum = tools.Sum.of(variants.map((variant) => variant.config.weight));

    if (sum !== 100) throw new Error(AbVariantsError.Sum);
  }
}
