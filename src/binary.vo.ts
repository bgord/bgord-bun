import * as v from "valibot";

export const BinaryError = { Type: "binary.type", BadChars: "binary.bad.chars" };

// One to sixty four letters, digits, hyphens, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_-]{1,64}$/;

export const Binary = v.pipe(
  v.string(BinaryError.Type),
  v.regex(CHARS_WHITELIST, BinaryError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("Binary"),
);

export type BinaryType = v.InferOutput<typeof Binary>;
