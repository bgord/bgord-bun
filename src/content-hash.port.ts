import type { Hash } from "./hash.vo";

export interface ContentHashPort {
  hash(content: string): Promise<Hash>;
}
