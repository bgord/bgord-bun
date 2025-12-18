import { Hash } from "./hash.vo";
import type { HashContentPort } from "./hash-content.port";

export class HashContentNoopAdapter implements HashContentPort {
  async hash(_content: string) {
    return Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000");
  }
}
