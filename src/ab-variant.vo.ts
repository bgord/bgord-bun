import type { AbVariantNameType } from "./ab-variant-name.vo";
import type { AbVariantWeightType } from "./ab-variant-weight.vo";

type Config = { name: AbVariantNameType; weight: AbVariantWeightType };

export class AbVariant {
  constructor(readonly config: Config) {}
}
