import * as tools from "@bgord/tools";
import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";
import type { RequestContext } from "./request-context.port";

export class RequestContextHonoAdapter implements RequestContext {
  readonly request: RequestContext["request"];
  readonly identity: RequestContext["identity"];
  readonly middleware: RequestContext["middleware"];

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
      queries: () => context.req.queries(),
      params: () => context.req.param(),
      param: (name: string) => context.req.param(name),
      cookie: (name) => getCookie(context)[name],
      json: async () => {
        try {
          const request = context.req.raw.clone();

          return await request.json();
        } catch {
          return {};
        }
      },
      text: async () => {
        try {
          const request = context.req.raw.clone();

          return await request.text();
        } catch {
          // Stryker disable next-line StringLiteral
          return "";
        }
      },
      form: async () => {
        try {
          const request = context.req.raw.clone();

          return await request.formData();
        } catch {
          return new FormData();
        }
      },
    };

    this.identity = {
      userId: () => context.get("user")?.id,
      ip: () =>
        context.req.header("x-real-ip") ||
        context.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        getConnInfo(context).remote.address,
      remoteIp: () => getConnInfo(context).remote.address,
      ua: () => context.req.header("user-agent"),
    };

    this.middleware = {
      revision: {
        fromWeakETag: () => tools.Revision.fromWeakETag(context.get("WeakETag")),
        fromETag: () => tools.Revision.fromETag(context.get("ETag")),
      },
      timeZoneOffset: () => context.get("timeZoneOffset"),
      language: () => context.get("language"),
    };
  }
}
