import type { Client } from "./client.vo";
import type { HashContentPort } from "./hash-content.port";
import type { VisitorIdStrategy } from "./visitor-id.strategy";

type Dependencies = { HashContent: HashContentPort };

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
