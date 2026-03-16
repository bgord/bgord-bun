import * as v from "valibot";

export const HashValueError = { Type: "hash.value.type", InvalidHex: "hash.value.invalid.hex" } as const;

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

export const HashValue = v.pipe(
  v.string(HashValueError.Type),
  v.regex(CHARS_WHITELIST, HashValueError.InvalidHex),
  // Stryker disable next-line StringLiteral
  v.brand("HashValue"),
);

export type HashValueType = v.InferOutput<typeof HashValue>;
