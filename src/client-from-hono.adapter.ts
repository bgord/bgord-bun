import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { Client } from "./client.vo";

export class ClientFromHono {
  static translate(context: Context): Client {
    const info = ClientFromHono.retrieveConnInfo(context);

    const ip =
      context.req.header("x-real-ip") || context.req.header("x-forwarded-for") || info?.remote?.address;

    const ua = context.req.header("user-agent");

    return Client.fromParts(ip, ua);
  }

  static retrieveConnInfo(context: Context) {
    return getConnInfo(context);
  }
}
