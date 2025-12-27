import type { Hash } from "./hash.vo";

export interface HashContentStrategy {
  hash(content: string): Promise<Hash>;
}
