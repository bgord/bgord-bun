import * as v from "valibot";

export const NonceValueError = {
  Type: "nonce.value.type",
  InvalidHex: "nonce.value.invalid.hex",
};

// 16 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]+$/;

export const NonceValue = v.pipe(
  v.string(NonceValueError.Type),
  v.length(16, NonceValueError.InvalidHex),
  v.regex(CHARS_WHITELIST, NonceValueError.InvalidHex),
  // Stryker disable next-line StringLiteral
  v.brand("NonceValue"),
);

export type NonceValueType = v.InferOutput<typeof NonceValue>;
