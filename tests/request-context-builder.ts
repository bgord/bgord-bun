import type * as tools from "@bgord/tools";
import { Duration, Revision } from "@bgord/tools";
import { HTTPException } from "hono/http-exception";
import type { RequestContext } from "../src/request-context.port";
import { ShieldAuthStrategyError } from "../src/shield-auth.strategy";
import type { UUIDType } from "../src/uuid.vo";

export class RequestContextBuilder {
  private path = "/";
  private method = "";
  private url = "/";
  private headers = new Headers();
  private rawHeaders: Record<string, string> = {};
  private queries: Record<string, Array<string>> = {};
  private params: Record<string, string> = {};
  private cookies: Record<string, string> = {};
  private json: Record<string, unknown> = {};
  private text = "";
  private form = new FormData();
  private userId: UUIDType | undefined = undefined;
  private ip: string | undefined = undefined;
  private remoteIp: string | undefined = undefined;
  private ua: string | undefined = undefined;
  private weakETag: tools.WeakETag | null = null;
  private etag: tools.ETag | null = null;
  private timeZoneOffset: tools.Duration = Duration.ZERO;
  private language: tools.LanguageType = "en";

  withPath(path: string) {
    this.path = path;
    return this;
  }

  withUrl(url: string) {
    this.url = url;
    return this;
  }

  withMethod(method: string) {
    this.method = method;
    return this;
  }

  withHeader(name: string, value: string) {
    this.headers.set(name, value);
    return this;
  }

  withRawHeader(name: string, value: string) {
    this.rawHeaders[name] = value;
    return this;
  }

  withHeaders(headers: ReadonlyArray<{ name: string; value: string }>) {
    headers.forEach((candidate) => this.headers.append(candidate.name, candidate.value));
    return this;
  }

  withJson(json: Record<string, unknown>) {
    this.json = json;
    return this;
  }

  withText(text: string) {
    this.text = text;
    return this;
  }

  withForm(form: FormData) {
    this.form = form;
    return this;
  }

  withQuery(query: Record<string, string>) {
    this.queries = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, [value]]));
    return this;
  }

  withQueries(queries: Record<string, Array<string>>) {
    this.queries = queries;
    return this;
  }

  withParams(params: Record<string, string>) {
    this.params = params;
    return this;
  }

  withCookie(name: string, value: string) {
    this.cookies[name] = value;
    return this;
  }

  withUserId(id: UUIDType | undefined) {
    this.userId = id;
    return this;
  }

  withIp(ip: string | undefined) {
    this.ip = ip;
    return this;
  }

  withRemoteIp(remoteIp: string | undefined) {
    this.remoteIp = remoteIp;
    return this;
  }

  withUa(ua: string | undefined) {
    this.ua = ua;
    return this;
  }

  build(): RequestContext {
    return {
      request: {
        path: this.path,
        method: this.method,
        url: () => this.url,
        header: (name) => this.rawHeaders[name] ?? this.headers.get(name) ?? undefined,
        headersObject: () => {
          const headers: Record<string, string> = {};

          this.headers.forEach((value, key) => {
            headers[key] = value;
          });

          return headers;
        },
        headers: () => this.headers,
        query: () =>
          Object.fromEntries(Object.entries(this.queries).map(([key, value]) => [key, value[0] ?? ""])),
        queries: () => this.queries,
        params: () => this.params,
        param: (name: string) => this.params[name],
        cookie: (name) => this.cookies[name],
        json: async () => this.json,
        text: async () => this.text,
        form: async () => this.form,
      },
      identity: {
        userId: () => this.userId,
        authenticatedUserId: () => {
          const userId = this.userId;

          if (userId !== undefined) return userId;
          throw new HTTPException(401, { message: ShieldAuthStrategyError.Rejected });
        },
        ip: () => this.ip,
        remoteIp: () => this.remoteIp ?? this.ip,
        ua: () => this.ua,
      },
      middleware: {
        revision: {
          fromWeakETag: () => Revision.fromWeakETag(this.weakETag),
          fromETag: () => Revision.fromETag(this.etag),
        },
        timeZoneOffset: () => this.timeZoneOffset,
        language: () => this.language,
      },
    };
  }
}
