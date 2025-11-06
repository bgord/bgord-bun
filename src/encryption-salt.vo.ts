import { z } from "zod/v4";

export const EncryptionSaltError = {
  Type: "encryption.salt.type",
  InvalidHex: "encryption.salt.invalid.hex",
} as const;

const ENCRYPTION_SALT_CHARS_WHITELIST = /^[0-9a-fA-F]{32}$/;

export const EncryptionSalt = z
  .string(EncryptionSaltError.Type)
  .regex(ENCRYPTION_SALT_CHARS_WHITELIST, EncryptionSaltError.InvalidHex)
  .brand("EncryptionSalt");

export type EncryptionSaltType = z.infer<typeof EncryptionSalt>;
