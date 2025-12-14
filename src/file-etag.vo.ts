import { z } from "zod/v4";

export const FileEtagError = { Type: "file.etag.type", InvalidHex: "file.etag.invalid.hex" } as const;

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

export const FileEtag = z
  .string(FileEtagError.Type)
  .regex(CHARS_WHITELIST, FileEtagError.InvalidHex)
  .brand("FileEtag");

export type FileEtagType = z.infer<typeof FileEtag>;
