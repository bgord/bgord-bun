import * as v from "valibot";

export const CommitShaValueError = {
  Type: "commit.sha.value.type",
  InvalidHex: "commit.sha.value.invalid.hex",
};

// 40 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]+$/;

export const CommitShaValue = v.pipe(
  v.string(CommitShaValueError.Type),
  v.length(40, CommitShaValueError.InvalidHex),
  v.regex(CHARS_WHITELIST, CommitShaValueError.InvalidHex),
  // Stryker disable next-line StringLiteral
  v.brand("CommitShaValue"),
);

export type CommitShaValueType = v.InferOutput<typeof CommitShaValue>;
