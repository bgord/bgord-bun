import type { Hash } from "./hash.vo";

export interface HashBytesStrategy {
  hash(content: ArrayBuffer): Promise<Hash>;
}
