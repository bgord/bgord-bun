import * as v from "valibot";

export const BinaryError = {
  Type: "binary.type",
  Empty: "binary.empty",
  TooLong: "binary.too.long",
  BadChars: "binary.bad.chars",
};

// One to sixty four letters, digits, hyphens, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_-]+$/;

export const Binary = v.pipe(
  v.string(BinaryError.Type),
  v.minLength(1, BinaryError.Empty),
  v.maxLength(64, BinaryError.TooLong),
  v.regex(CHARS_WHITELIST, BinaryError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("Binary"),
);

export type BinaryType = v.InferOutput<typeof Binary>;
