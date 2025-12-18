import { Hash } from "./hash.vo";
import type { HashContentPort } from "./hash-content.port";

export class HashContentSha256BunAdapter implements HashContentPort {
  async hash(content: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
    const etag = Buffer.from(digest).toString("hex");

    return Hash.fromString(etag);
  }
}
