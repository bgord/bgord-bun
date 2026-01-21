import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";
import type { RequestContext } from "./request-context.port";

export class RequestContextAdapterHono implements RequestContext {
  readonly request: RequestContext["request"];
  readonly identity: RequestContext["identity"];

  constructor(context: Context) {
    this.request = {
      path: context.req.path,
      header: (name) => context.req.header(name),
      query: () => context.req.query() ?? {},
      cookies: () => getCookie(context),
      rawHeaders: () => context.req.raw.headers,
      raw: () => context.req.raw.clone(),
    };

    this.identity = {
      userId: () => context.get("user")?.id ?? null,

      ip: () => {
        const info = getConnInfo(context);
        const realIp = context.req.header("x-real-ip");
        const forwarderdFor = context.req.header("x-forwarded-for");

        return (realIp || forwarderdFor || info?.remote?.address) ?? null;
      },

      userAgent: () => context.req.header("user-agent") ?? null,
    };
  }
}
