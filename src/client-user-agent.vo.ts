import * as z from "zod/v4";

export const ClientUserAgentError = {
  Type: "client.user.agent.type",
  Empty: "client.user.agent.empty",
  TooLong: "client.user.agent.too.long",
};

// Stryker disable all
export const ClientUserAgent = z
  // Stryker restore all
  .string(ClientUserAgentError.Type)
  .min(1, ClientUserAgentError.Empty)
  .max(128, ClientUserAgentError.TooLong)
  .brand("ClientUserAgent");

export type ClientUserAgentType = z.infer<typeof ClientUserAgent>;
