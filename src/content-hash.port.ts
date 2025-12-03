export type ContentHashResult = { etag: string };

export interface ContentHashPort {
  hash(content: string): Promise<ContentHashResult>;
}
