import { z } from "zod/v4";

export const SecurityRuleNameError = {
  Type: "security.rule.name.type",
  Empty: "security.rule.name.empty",
  TooLong: "security.rule.name.too.long",
  BadChars: "security.rule.name.bad.chars",
};

// One to sixty four letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]{1,512}$/;

// Stryker disable all
export const SecurityRuleName = z
  // Stryker restore all
  .string(SecurityRuleNameError.Type)
  .min(1, SecurityRuleNameError.Empty)
  .max(512, SecurityRuleNameError.TooLong)
  .regex(CHARS_WHITELIST, SecurityRuleNameError.BadChars)
  .brand("SecurityRuleName");

export type SecurityRuleNameType = z.infer<typeof SecurityRuleName>;
