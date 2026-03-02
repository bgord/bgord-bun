import type { AbVariantWeightType } from "./ab-variant-weight.vo";

type AbVariantConfigType = { name: string; weight: AbVariantWeightType };

export class AbVariant {
  constructor(readonly config: AbVariantConfigType) {}
}
