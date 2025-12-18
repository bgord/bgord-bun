import type { ContentHashPort } from "./content-hash.port";
import { Hash } from "./hash.vo";

export class ContentHashNoopAdapter implements ContentHashPort {
  async hash(_content: string) {
    return Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000");
  }
}
