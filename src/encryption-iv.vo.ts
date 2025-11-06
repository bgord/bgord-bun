import { z } from "zod/v4";

const ENCRYPTION_IV_CHARS_WHITELIST = /^[0-9a-fA-F]{24}$/;

export const EncryptionIvError = {
  Type: "encryption.iv.type",
  InvalidHex: "encryption.iv.invalid.hex",
} as const;

export const EncryptionIv = z
  .string(EncryptionIvError.Type)
  .regex(ENCRYPTION_IV_CHARS_WHITELIST, EncryptionIvError.InvalidHex)
  .brand("EncryptionIv");

export type EncryptionIvType = z.infer<typeof EncryptionIv>;
