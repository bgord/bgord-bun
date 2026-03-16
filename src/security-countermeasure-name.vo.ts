import * as v from "valibot";

export const SecurityCountermeasureNameError = {
  Type: "security.countermeasure.name.type",
  Empty: "security.countermeasure.name.empty",
  TooLong: "security.countermeasure.name.too.long",
  BadChars: "security.countermeasure.name.bad.chars",
};

// One to sixty four letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]+$/;

export const SecurityCountermeasureName = v.pipe(
  v.string(SecurityCountermeasureNameError.Type),
  v.minLength(1, SecurityCountermeasureNameError.Empty),
  v.maxLength(64, SecurityCountermeasureNameError.TooLong),
  v.regex(CHARS_WHITELIST, SecurityCountermeasureNameError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("SecurityCountermeasureName"),
);

export type SecurityCountermeasureNameType = v.InferOutput<typeof SecurityCountermeasureName>;
