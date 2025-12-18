import type { Client } from "./client.vo";
import type { ContentHashPort } from "./content-hash.port";
import type { VisitorIdPort } from "./visitor-id.port";

type Dependencies = { ContentHash: ContentHashPort };

export class VisitorIdHashAdapter implements VisitorIdPort {
  constructor(
    private readonly client: Client,
    private readonly deps: Dependencies,
  ) {}

  async get() {
    const { ip, ua } = this.client.toJSON();

    const value = `${ip}|${ua}`;

    return this.deps.ContentHash.hash(value);
  }
}
