import type { Context } from "hono";
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
    };

    this.identity = {
      userId: () => context.get("user")?.id ?? null,
      ip: () => context.req.header("x-forwarded-for") ?? null,
    };
  }
}
