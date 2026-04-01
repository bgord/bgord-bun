import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";
import type { RequestContext } from "./request-context.port";

export class RequestContextHonoAdapter implements RequestContext {
  readonly request: RequestContext["request"];
  readonly identity: RequestContext["identity"];

  constructor(context: Context) {
    this.request = {
      path: context.req.path,
      method: context.req.method,
      url: () => context.req.url,
      header: (name) => context.req.header(name),
      headers: () => context.req.raw.headers,
      headersObject: () => {
        const headers: Record<string, string> = {};

        context.req.raw.headers.forEach((value, key) => {
          headers[key] = value;
        });

        return headers;
      },
      query: () => context.req.query(),
      params: () => context.req.param(),
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
      userId: () => context.get("user")?.id,
      ip: () =>
        context.req.header("x-real-ip") ||
        context.req.header("x-forwarded-for") ||
        getConnInfo(context).remote.address,
      ua: () => context.req.header("user-agent"),
    };
  }
}
