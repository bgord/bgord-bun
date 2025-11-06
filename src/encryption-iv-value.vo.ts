import { z } from "zod/v4";

const ENCRYPTION_IV_VALUE_CHARS_WHITELIST = /^[0-9a-fA-F]{24}$/;

export const EncryptionIvValueError = {
  Type: "encryption.iv.value.type",
  InvalidHex: "encryption.iv.value.invalid.hex",
} as const;

export const EncryptionIvValue = z
  .string(EncryptionIvValueError.Type)
  .regex(ENCRYPTION_IV_VALUE_CHARS_WHITELIST, EncryptionIvValueError.InvalidHex)
  .brand("EncryptionIv");

export type EncryptionIvValueType = z.infer<typeof EncryptionIvValue>;
