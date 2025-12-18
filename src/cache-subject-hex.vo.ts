import { z } from "zod/v4";

export const CacheSubjectHexError = {
  Type: "cache.subject.hex.type",
  InvalidHex: "cache.subject.hex.invalid.hex",
} as const;

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

export const CacheSubjectHex = z
  .string(CacheSubjectHexError.Type)
  .regex(CHARS_WHITELIST, CacheSubjectHexError.InvalidHex)
  .brand("CacheSubjectHex");

export type CacheSubjectHexType = z.infer<typeof CacheSubjectHex>;
