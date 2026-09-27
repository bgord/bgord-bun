import { Hash } from "./hash.vo";
import type { HashBytesStrategy } from "./hash-bytes.strategy";

export class HashBytesSha256Strategy implements HashBytesStrategy {
  async hash(content: Uint8Array<ArrayBuffer>): Promise<Hash> {
    const digest = await crypto.subtle.digest("SHA-256", content);

    return Hash.fromBuffer(new Uint8Array(digest));
  }
}
