import type { Request } from "express";
import type { RequestContext } from "./request-context.port";

export class RequestContextExpressAdapter implements RequestContext {
  readonly request: RequestContext["request"];
  readonly identity: RequestContext["identity"];

  constructor(request: Request) {
    this.request = {
      path: request.path,
      method: request.method,
      url: () => {
        const protocol = request.protocol || "http";
        const host = request.get("host") || "localhost";

        return `${protocol}://${host}${request.originalUrl}`;
      },
      header: (name) => request.get(name),
      headers: () => {
        const headers = new Headers();

        for (const [key, value] of Object.entries(request.headers)) {
          if (value !== undefined) {
            const headerValue = Array.isArray(value) ? value[0] : value;
            if (headerValue !== undefined) {
              headers.set(key, headerValue);
            }
          }
        }
        return headers;
      },
      headersObject: () => {
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(request.headers)) {
          if (value !== undefined) {
            const headerValue = Array.isArray(value) ? value[0] : value;
            if (headerValue !== undefined) {
              headers[key] = headerValue;
            }
          }
        }
        return headers;
      },
      query: () => {
        const query: Record<string, string> = {};
        for (const [key, value] of Object.entries(request.query)) {
          if (typeof value === "string") {
            query[key] = value;
          } else if (Array.isArray(value) && value[0]) {
            query[key] = String(value[0]);
          }
        }
        return query;
      },
      params: () => request.params as Record<string, string>,
      cookie: (name) => new Bun.CookieMap(request.get("cookie")).get(name) ?? undefined,
      json: async () => request.body,
    };

    this.identity = {
      userId: () => (request as any).user?.id ?? undefined,
      ip: () => request.get("x-real-ip") || request.get("x-forwarded-for") || request.socket.remoteAddress,
      ua: () => request.get("user-agent"),
    };
  }
}
