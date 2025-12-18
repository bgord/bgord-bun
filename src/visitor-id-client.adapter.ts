import type { Client } from "./client.vo";
import type { HashContentPort } from "./hash-content.port";
import type { VisitorIdPort } from "./visitor-id.port";

type Dependencies = { HashContent: HashContentPort };

export class VisitorIdClientAdapter implements VisitorIdPort {
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
