import type { Hash } from "./hash.vo";

export interface HashContentPort {
  hash(content: string): Promise<Hash>;
}
