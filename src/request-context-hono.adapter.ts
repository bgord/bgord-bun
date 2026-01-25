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
      method: context.req.method,
      header: (name) => context.req.header(name),
      headers: () => context.req.raw.headers,
      query: () => context.req.query(),
      cookie: (name) => getCookie(context)[name],
      json: async () => {
        try {
          const request = context.req.raw.clone();

          return await request.json();
        } catch {
          return {};
        }
      },
    };

    this.identity = {
      userId: () => context.get("user")?.id ?? undefined,
      ip: () =>
        context.req.header("x-real-ip") ||
        context.req.header("x-forwarded-for") ||
        getConnInfo(context).remote.address,
      ua: () => context.req.header("user-agent"),
    };
  }
}
