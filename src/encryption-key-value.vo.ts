import * as v from "valibot";

export const EncryptionKeyValueError = {
  Type: "encryption.key.value.type",
  InvalidHex: "encryption.key.value.invalid.hex",
};

// 64 hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]{64}$/;

export const EncryptionKeyValue = v.pipe(
  v.string(EncryptionKeyValueError.Type),
  v.regex(CHARS_WHITELIST, EncryptionKeyValueError.InvalidHex),
  // Stryker disable next-line StringLiteral
  v.brand("EncryptionKeyValue"),
);

export type EncryptionKeyValueType = v.InferOutput<typeof EncryptionKeyValue>;
