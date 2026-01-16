import * as z from "zod/v4";

export const HashValueError = { Type: "hash.value.type", InvalidHex: "hash.value.invalid.hex" } as const;

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

// Stryker disable all
export const HashValue = z
  // Stryker restore all
  .string(HashValueError.Type)
  .regex(CHARS_WHITELIST, HashValueError.InvalidHex)
  .brand("HashValue");

export type HashValueType = z.infer<typeof HashValue>;
