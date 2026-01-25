import type { RequestContext } from "../src/request-context.port";

export class RequestContextBuilder {
  private path = "/";
  private method = "";
  private headers = new Headers();
  private query: Record<string, string> = {};
  private cookies: Record<string, string> = {};
  private json: Record<string, unknown> = {};
  private userId: string | undefined = undefined;
  private ip: string | undefined = undefined;
  private ua: string | undefined = undefined;

  withPath(path: string) {
    this.path = path;
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

  withHeaders(headers: { name: string; value: string }[]) {
    headers.forEach((candidate) => this.headers.append(candidate.name, candidate.value));
    return this;
  }

  withJson(json: Record<string, unknown>) {
    this.json = json;
    return this;
  }

  withQuery(query: Record<string, string>) {
    this.query = query;
    return this;
  }

  withCookie(name: string, value: string) {
    this.cookies[name] = value;
    return this;
  }

  withUserId(id: string | undefined) {
    this.userId = id;
    return this;
  }

  withIp(ip: string | undefined) {
    this.ip = ip;
    return this;
  }

  withUserAgent(ua: string | undefined) {
    this.ua = ua;
    return this;
  }

  build(): RequestContext {
    return {
      request: {
        path: this.path,
        method: this.method,
        header: (name) => this.headers.get(name) ?? undefined,
        headers: () => this.headers,
        query: () => this.query,
        cookie: (name) => this.cookies[name],
        json: async () => this.json,
      },
      identity: {
        userId: () => this.userId,
        ip: () => this.ip,
        ua: () => this.ua,
      },
    };
  }
}
