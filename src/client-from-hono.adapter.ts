import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { Client } from "./client.vo";

export class ClientFromHonoAdapter {
  static extract(context: Context): Client {
    const info = getConnInfo(context);

    const ip =
      context.req.header("x-real-ip") || context.req.header("x-forwarded-for") || info?.remote?.address;

    const ua = context.req.header("user-agent");

    return Client.from(ip, ua);
  }
}
