import type { RequestContext } from "../src/request-context.port";

export class RequestContextBuilder {
  private path = "/";
  private headers = new Headers();
  private query: Record<string, string> = {};
  private cookies: Record<string, string> = {};
  private json: Record<string, unknown> = {};
  private userId: string | undefined = undefined;
  private ip: string | undefined = undefined;
  private userAgent: string | undefined = undefined;

  withPath(path: string) {
    this.path = path;
    return this;
  }

  withHeader(name: string, value: string) {
    this.headers.set(name, value);
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

  withUserAgent(userAgent: string | undefined) {
    this.userAgent = userAgent;
    return this;
  }

  build(): RequestContext {
    return {
      request: {
        path: this.path,
        header: (name) => this.headers.get(name) ?? undefined,
        query: () => this.query,
        cookies: () => this.cookies,
        json: async () => this.json,
      },
      identity: {
        userId: () => this.userId,
        ip: () => this.ip,
        userAgent: () => this.userAgent,
      },
    };
  }
}
