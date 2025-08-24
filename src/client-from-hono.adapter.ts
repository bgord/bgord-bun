import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { Client } from "./client.vo";

export class ClientFromHono {
  static extract(c: Context): Client {
    const info = getConnInfo(c);

    const ip = c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || info.remote.address;

    const ua = c.req.header("user-agent");

    return Client.from(ip, ua);
  }
}
