import type { AbVariantWeightType } from "./ab-variant-weight.vo";

type Config = { name: string; weight: AbVariantWeightType };

export class AbVariant {
  constructor(readonly config: Config) {}
}
