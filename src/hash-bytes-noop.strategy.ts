import { Hash } from "./hash.vo";
import type { HashBytesStrategy } from "./hash-bytes.strategy";

export class HashBytesNoopStrategy implements HashBytesStrategy {
  async hash(_content: Uint8Array<ArrayBuffer>): Promise<Hash> {
    return Hash.fromString("0".repeat(64));
  }
}
