import { z } from "zod/v4";

export const ClientIpError = { Type: "client.ip.type" };

export const ClientIp = z
  .string(ClientIpError.Type)
  .transform((value) => {
    const result = z.ipv4().safeParse(value);

    return result.success ? result.data : "anon";
  })
  .brand("ClientIp");

export type ClientIpType = z.infer<typeof ClientIp>;
