import * as v from "valibot";

export const AbVariantWeightErrors = { MinMax: "ab.variant.weight.min.max" };

export const AbVariantWeight = v.pipe(
  v.number(AbVariantWeightErrors.MinMax),
  v.integer(AbVariantWeightErrors.MinMax),
  v.minValue(1, AbVariantWeightErrors.MinMax),
  v.maxValue(99, AbVariantWeightErrors.MinMax),
  // Stryker disable next-line StringLiteral
  v.brand("AbVariantWeight"),
);

export type AbVariantWeightType = v.InferOutput<typeof AbVariantWeight>;
