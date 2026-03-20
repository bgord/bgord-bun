import * as v from "valibot";

export const TelephoneNumberError = {
  Type: "telephone.number.type",
  Invalid: "telephone.number.invalid",
};

// E.164 format: + followed by 2-15 digits, no leading zero in country code
const E164 = /^\+[1-9]\d{1,14}$/;

export const TelephoneNumber = v.pipe(
  v.string(TelephoneNumberError.Type),
  v.regex(E164, TelephoneNumberError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("TelephoneNumber"),
);

export type TelephoneNumberType = v.InferOutput<typeof TelephoneNumber>;
