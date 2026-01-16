import * as z from "zod/v4";

export const EncryptionKeyValueError = {
  Type: "encryption.key.value.type",
  InvalidHex: "encryption.key.value.invalid.hex",
};

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

// Stryker disable all
export const EncryptionKeyValue = z
  // Stryker restore all
  .string(EncryptionKeyValueError.Type)
  .regex(CHARS_WHITELIST, EncryptionKeyValueError.InvalidHex)
  .brand("EncryptionKeyValue");

export type EncryptionKeyValueType = z.infer<typeof EncryptionKeyValue>;
