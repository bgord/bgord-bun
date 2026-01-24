import { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";

export class HashContentSha256Strategy implements HashContentStrategy {
  async hash(content: string): Promise<Hash> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));

    return Hash.fromString(new Uint8Array(digest).toHex());
  }
}
