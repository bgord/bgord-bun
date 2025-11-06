import { z } from "zod/v4";

export const EncryptionKeyError = {
  Type: "encryption.key.type",
  InvalidHex: "encryption.key.invalid.hex",
} as const;

const CHARS_WHITELIST = /^[0-9a-fA-F]{64}$/;

export const EncryptionKey = z
  .string(EncryptionKeyError.Type)
  .regex(CHARS_WHITELIST, EncryptionKeyError.InvalidHex)
  .brand("EncryptionKey");

export type EncryptionKeyType = z.infer<typeof EncryptionKey>;
