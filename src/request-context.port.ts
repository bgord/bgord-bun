import type { UUIDType } from "./uuid.vo";

export interface RequestContext {
  readonly request: {
    readonly path: string;
    header(name: string): string | undefined;
    query(): Record<string, string>;
    cookie(name: string): string | undefined;
    json(): Promise<Record<string, unknown>>;
  };

  readonly identity: {
    userId(): UUIDType | undefined;
    ip(): string | undefined;
    ua(): string | undefined;
  };
}

export interface HasRequestPath {
  readonly request: { readonly path: string };
}

export interface HasRequestHeader {
  readonly request: { header(name: string): string | undefined };
}

export interface HasRequestQuery {
  readonly request: { query(): Record<string, string> };
}

export interface HasRequestCookie {
  readonly request: { cookie(name: string): string | undefined };
}

export interface HasRequestJSON {
  readonly request: { json(): Promise<Record<string, unknown>> };
}

export interface HasIdentityUserId {
  readonly identity: { userId(): UUIDType | undefined };
}

export interface HasIdentityIp {
  readonly identity: { ip(): string | undefined };
}

export interface HasIdentityU {
  readonly identity: { ua(): string | undefined };
}
