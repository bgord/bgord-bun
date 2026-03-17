import * as v from "valibot";

export const SecurityRuleNameError = {
  Type: "security.rule.name.type",
  BadChars: "security.rule.name.bad.chars",
};

// One to five hundred twelve letters, digits, or underscores
const CHARS_WHITELIST = /^[a-zA-Z0-9_]{1,512}$/;

export const SecurityRuleName = v.pipe(
  v.string(SecurityRuleNameError.Type),
  v.regex(CHARS_WHITELIST, SecurityRuleNameError.BadChars),
  // Stryker disable next-line StringLiteral
  v.brand("SecurityRuleName"),
);

export type SecurityRuleNameType = v.InferOutput<typeof SecurityRuleName>;
