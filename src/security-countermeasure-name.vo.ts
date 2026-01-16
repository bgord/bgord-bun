import * as z from "zod/v4";

export const SecurityCountermeasureNameError = {
  Type: "security.countermeasure.name.type",
  Empty: "security.countermeasure.name.empty",
  TooLong: "security.countermeasure.name.too.long",
  BadChars: "security.countermeasure.name.bad.chars",
};

// One to sixty four letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]{1,64}$/;

// Stryker disable all
export const SecurityCountermeasureName = z
  // Stryker restore all
  .string(SecurityCountermeasureNameError.Type)
  .min(1, SecurityCountermeasureNameError.Empty)
  .max(64, SecurityCountermeasureNameError.TooLong)
  .regex(CHARS_WHITELIST, SecurityCountermeasureNameError.BadChars)
  .brand("SecurityCountermeasureName");

export type SecurityCountermeasureNameType = z.infer<typeof SecurityCountermeasureName>;
