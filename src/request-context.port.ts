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
