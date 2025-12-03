import type { ContentHashPort } from "./content-hash.port";

export class ContentHashSha256BunAdapter implements ContentHashPort {
  async hash(content: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
    const etag = Buffer.from(digest).toString("hex");

    return { etag };
  }
}
