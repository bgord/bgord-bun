import * as v from "valibot";

export const SecurityCountermeasureNameError = {
  Type: "security.countermeasure.name.type",
  BadChars: "security.countermeasure.name.bad.chars",
};

// One to sixty four letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]{1,64}$/;

export const SecurityCountermeasureName = v.pipe(
  v.string(SecurityCountermeasureNameError.Type),
  v.regex(CHARS_WHITELIST, SecurityCountermeasureNameError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("SecurityCountermeasureName"),
);

export type SecurityCountermeasureNameType = v.InferOutput<typeof SecurityCountermeasureName>;
