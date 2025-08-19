import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorIdHash } from "./visitor-id-hash.adapter";

export class VisitorIdHashHono implements VisitorIdPort {
  private readonly delegate: VisitorIdHash;

  constructor(context: Context) {
    const ip = this.extractIpFrom(context);
    const ua = this.extractUaFrom(context);

    this.delegate = new VisitorIdHash(ip, ua);
  }

  async get() {
    return this.delegate.get();
  }

  private extractIpFrom(c: Context): string {
    const info = getConnInfo(c);

    return (c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || info.remote.address) ?? "anon";
  }

  private extractUaFrom(c: Context): string {
    return c.req.header("user-agent") ?? "anon";
  }
}
