import * as z from "zod/v4";

export const BinaryError = {
  Type: "binary.type",
  Empty: "binary.empty",
  TooLong: "binary.too.long",
  BadChars: "binary.bad.chars",
};

// One to sixty four letters, digits, hyphens, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9-_]{1,64}$/;

// Stryker disable all
export const Binary = z
  // Stryker restore all
  .string(BinaryError.Type)
  .min(1, BinaryError.Empty)
  .max(64, BinaryError.TooLong)
  .regex(CHARS_WHITELIST, BinaryError.BadChars)
  .brand("Binary");

export type BinaryType = z.infer<typeof Binary>;
