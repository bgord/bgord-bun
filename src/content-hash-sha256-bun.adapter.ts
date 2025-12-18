import type { ContentHashPort } from "./content-hash.port";
import { Hash } from "./hash.vo";

export class ContentHashSha256BunAdapter implements ContentHashPort {
  async hash(content: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
    const etag = Buffer.from(digest).toString("hex");

    return Hash.fromString(etag);
  }
}
