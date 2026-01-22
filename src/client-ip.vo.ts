import * as z from "zod/v4";

export const ClientIpError = { Invalid: "client.ip.invalid" };

// Stryker disable all
export const ClientIp = z.ipv4(ClientIpError.Invalid).brand("ClientIp");
// Stryker restore all

export type ClientIpType = z.infer<typeof ClientIp>;
