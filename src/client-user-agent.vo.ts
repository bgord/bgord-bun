import * as v from "valibot";

export const ClientUserAgentError = {
  Type: "client.user.agent.type",
  Invalid: "client.user.agent.invalid",
};

// ASCII printable characters
const CHARS_BLACKLIST = /^[\x20-\x7E]{1,256}$/;

export const ClientUserAgent = v.pipe(
  v.string(ClientUserAgentError.Type),
  v.regex(CHARS_BLACKLIST, ClientUserAgentError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("ClientUserAgent"),
);

export type ClientUserAgentType = v.InferOutput<typeof ClientUserAgent>;
