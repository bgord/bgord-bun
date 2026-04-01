import * as v from "valibot";

export const ClientIpError = { Invalid: "client.ip.invalid" };

export const ClientIp = v.pipe(
  v.string(ClientIpError.Invalid),
  v.ip(ClientIpError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("ClientIp"),
);

export type ClientIpType = v.InferOutput<typeof ClientIp>;
