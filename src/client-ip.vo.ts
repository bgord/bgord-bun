import { z } from "zod/v4";

export const ClientIpError = { Type: "client.ip.type", InvalidUnknown: "client.ip.invalid.unknown" };

export const ClientIp = z
  .ipv4(ClientIpError.Type)
  .or(z.literal("anon", ClientIpError.InvalidUnknown))
  .brand("ClientUserAgent");

export type ClientIpType = z.infer<typeof ClientIp>;
