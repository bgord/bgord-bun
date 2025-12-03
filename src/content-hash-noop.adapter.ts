import type { ContentHashPort } from "./content-hash.port";

export class ContentHashNoopAdapter implements ContentHashPort {
  async hash(_content: string) {
    return { etag: "noop" };
  }
}
