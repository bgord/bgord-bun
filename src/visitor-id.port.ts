import type { Hash } from "./hash.vo";

export interface VisitorIdPort {
  get(): Promise<Hash>;
}
