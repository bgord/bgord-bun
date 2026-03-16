import * as v from "valibot";

export const SecurityRuleNameError = {
  Type: "security.rule.name.type",
  Empty: "security.rule.name.empty",
  TooLong: "security.rule.name.too.long",
  BadChars: "security.rule.name.bad.chars",
};

// One to five hundred twelve letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]+$/;

export const SecurityRuleName = v.pipe(
  v.string(SecurityRuleNameError.Type),
  v.minLength(1, SecurityRuleNameError.Empty),
  v.maxLength(512, SecurityRuleNameError.TooLong),
  v.regex(CHARS_WHITELIST, SecurityRuleNameError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("SecurityRuleName"),
);

export type SecurityRuleNameType = v.InferOutput<typeof SecurityRuleName>;
