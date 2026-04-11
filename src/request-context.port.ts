import type { UUIDType } from "./uuid.vo";

export interface RequestContext {
  readonly request: {
    readonly path: string;
    readonly method: string;
    url(): string;
    header(name: string): string | undefined;
    query(): Record<string, string>;
    params(): Record<string, string>;
    param(name: string): string | undefined;
    cookie(name: string): string | undefined;
    json(): Promise<Record<string, unknown>>;
    text(): Promise<string>;
    headers: () => Headers;
    headersObject: () => Record<string, string>;
  };

  readonly identity: {
    userId(): UUIDType | undefined;
    ip(): string | undefined;
    ua(): string | undefined;
  };
}

export interface HasRequestUrl {
  readonly request: { url(): string };
}

export interface HasRequestPath {
  readonly request: { readonly path: string };
}

export interface HasRequestMethod {
  readonly request: { readonly method: string };
}

export interface HasRequestHeader {
  readonly request: { header(name: string): string | undefined };
}

export interface HasRequestHeaders {
  readonly request: { headers: () => Headers };
}

export interface HasRequestHeadersObject {
  readonly request: { headersObject: () => Record<string, string> };
}

export interface HasRequestQuery {
  readonly request: { query(): Record<string, string> };
}

export interface HasRequestParams {
  readonly request: { params(): Record<string, string> };
}

export interface HasRequestParam {
  readonly request: { param(name: string): string | undefined };
}

export interface HasRequestCookie {
  readonly request: { cookie(name: string): string | undefined };
}

export interface HasRequestJSON {
  readonly request: { json(): Promise<Record<string, unknown>> };
}

export interface HasRequestText {
  readonly request: { text(): Promise<string> };
}

export interface HasIdentityUserId {
  readonly identity: { userId(): UUIDType | undefined };
}

export interface HasIdentityIp {
  readonly identity: { ip(): string | undefined };
}

export interface HasIdentityUa {
  readonly identity: { ua(): string | undefined };
}
