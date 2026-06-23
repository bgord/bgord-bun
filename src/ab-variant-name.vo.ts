import * as v from "valibot";

export const AbVariantNameError = {
  Type: "ab.variant.name.type",
  Empty: "ab.variant.name.empty",
  TooLong: "ab.variant.name.too.long",
};

export const AbVariantName = v.pipe(
  v.string(AbVariantNameError.Type),
  v.minLength(1, AbVariantNameError.Empty),
  v.maxLength(128, AbVariantNameError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("AbVariantName"),
);

export type AbVariantNameType = v.InferOutput<typeof AbVariantName>;
