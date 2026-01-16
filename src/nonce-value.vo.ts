import * as z from "zod/v4";

export const NonceValueError = {
  Type: "nonce.value.type",
  InvalidHex: "nonce.value.invalid.hex",
};

// 16 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{16}$/;

// Stryker disable all
export const NonceValue = z
  // Stryker restore all
  .string(NonceValueError.Type)
  .regex(CHARS_WHITELIST, NonceValueError.InvalidHex)
  .brand("NonceValue");

export type NonceValueType = z.infer<typeof NonceValue>;
