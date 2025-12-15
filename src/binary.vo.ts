import { z } from "zod/v4";

export const BinaryError = {
  Type: "binary.type",
  Empty: "binary.empty",
  TooLong: "binary.too.long",
  BadChars: "binary.bad.chars",
};

// One to sixty four letters, digits, hyphens, or underscores
const BINARY_WHITELIST = /^[a-zA-Z0-9-_]{1,64}$/;

export const Binary = z
  .string(BinaryError.Type)
  .min(1, BinaryError.Empty)
  .max(64, BinaryError.TooLong)
  .regex(BINARY_WHITELIST, BinaryError.BadChars)
  .brand("Binary");

export type BinaryType = z.infer<typeof Binary>;
