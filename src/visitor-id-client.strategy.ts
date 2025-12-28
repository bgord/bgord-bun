import type { Client } from "./client.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { VisitorIdStrategy } from "./visitor-id.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export class VisitorIdClientStrategy implements VisitorIdStrategy {
  constructor(
    private readonly client: Client,
    private readonly deps: Dependencies,
  ) {}

  async get() {
    const { ip, ua } = this.client.toJSON();

    const value = `${ip}|${ua}`;

    return this.deps.HashContent.hash(value);
  }
}
