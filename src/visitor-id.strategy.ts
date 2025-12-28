import type { Hash } from "./hash.vo";

export interface VisitorIdStrategy {
  get(): Promise<Hash>;
}
