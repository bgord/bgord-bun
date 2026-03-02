import * as z from "zod/v4";

export const AbVariantWeightErrors = { MinMax: "ab.variant.weight.min.max" };

// Stryker disable all
export const AbVariantWeight = z
  // Stryker restore all
  .int(AbVariantWeightErrors.MinMax)
  .gte(1, AbVariantWeightErrors.MinMax)
  .lte(99, AbVariantWeightErrors.MinMax)
  .brand("AbVariantWeight");

export type AbVariantWeightType = z.infer<typeof AbVariantWeight>;
