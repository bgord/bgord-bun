import { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";

export class HashContentNoopStrategy implements HashContentStrategy {
  async hash(_content: string): Promise<Hash> {
    return Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000");
  }
}
