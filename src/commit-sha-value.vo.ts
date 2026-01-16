import * as z from "zod/v4";

export const CommitShaValueError = {
  Type: "commit.sha.value.type",
  InvalidHex: "commit.sha.value.invalid.hex",
};

// 40 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{40}$/;

// Stryker disable all
export const CommitShaValue = z
  // Stryker restore all
  .string(CommitShaValueError.Type)
  .regex(CHARS_WHITELIST, CommitShaValueError.InvalidHex)
  .brand("CommitShaValue");

export type CommitShaValueType = z.infer<typeof CommitShaValue>;
