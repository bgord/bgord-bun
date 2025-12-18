import { z } from "zod/v4";

export const CacheSubjectError = {
  Type: "cache.subject.hex.type",
  InvalidHex: "cache.subject.hex.invalid.hex",
} as const;

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

export const CacheSubject = z
  .string(CacheSubjectError.Type)
  .regex(CHARS_WHITELIST, CacheSubjectError.InvalidHex)
  .brand("CacheSubjectHex");

export type CacheSubjectType = z.infer<typeof CacheSubject>;
