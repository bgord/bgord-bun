export interface RequestContext {
  readonly request: {
    readonly path: string;
    header(name: string): string | undefined;
    query(): Record<string, string>;
    cookies(): Record<string, string>;
    rawHeaders(): Headers;
    raw(): Request;
  };

  readonly identity: { userId(): string | null; ip(): string | null; userAgent(): string | null };
}
