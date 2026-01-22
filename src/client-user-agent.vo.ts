import * as z from "zod/v4";

export const ClientUserAgentError = {
  Type: "client.user.agent.type",
  Invalid: "client.user.agent.invalid",
};

// ASCII printable characters
const CHARS_BLACKLIST = /^[\x20-\x7E]{1,256}$/;

// Stryker disable all
export const ClientUserAgent = z
  // Stryker restore all
  .string(ClientUserAgentError.Type)
  .regex(CHARS_BLACKLIST, ClientUserAgentError.Invalid)
  .brand("ClientUserAgent");

export type ClientUserAgentType = z.infer<typeof ClientUserAgent>;
