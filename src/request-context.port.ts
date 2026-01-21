export interface RequestContext {
  readonly request: {
    readonly path: string;
    header(name: string): string | undefined;
    query(): Record<string, string>;
    cookies(): Record<string, string>;
    json(): Promise<Record<string, unknown>>;
  };

  readonly identity: {
    userId(): string | undefined;
    ip(): string | undefined;
    userAgent(): string | undefined;
  };
}
