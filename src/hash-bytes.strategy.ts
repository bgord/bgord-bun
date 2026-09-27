import type { Hash } from "./hash.vo";

export interface HashBytesStrategy {
  hash(content: Uint8Array<ArrayBuffer>): Promise<Hash>;
}
