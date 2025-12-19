import type { Context } from "hono";
import { getConnInfo } from "hono/bun";

export type ClientIpType = string;
export type ClientUaType = string;
export type ClientType = { ip: ClientIpType; ua: ClientUaType };

export class Client {
  private constructor(private readonly value: ClientType) {}

  static fromParts(ip: ClientIpType | null | undefined, ua: ClientUaType | null | undefined): Client {
    return new Client({ ip: ip ?? "anon", ua: ua ?? "anon" });
  }

  static fromHonoContext(context: Context): Client {
    const info = getConnInfo(context);

    const ip =
      context.req.header("x-real-ip") || context.req.header("x-forwarded-for") || info?.remote?.address;

    const ua = context.req.header("user-agent");

    return Client.fromParts(ip, ua);
  }

  matches(another: Client): boolean {
    return this.value.ip === another.value.ip && this.value.ua === another.value.ua;
  }

  matchesUa(another: Client): boolean {
    return this.value.ua === another.value.ua;
  }

  matchesIp(another: Client): boolean {
    return this.value.ip === another.value.ip;
  }

  toJSON(): ClientType {
    return this.value;
  }
}
