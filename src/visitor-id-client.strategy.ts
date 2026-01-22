import type { Client } from "./client.vo";
import type { Hash } from "./hash.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { VisitorIdStrategy } from "./visitor-id.strategy";

type Dependencies = { HashContent: HashContentStrategy };

export class VisitorIdClientStrategy implements VisitorIdStrategy {
  constructor(
    private readonly client: Client,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<Hash> {
    const value = `${this.client.ip ?? "anon"}|${this.client.ua ?? "anon"}`;

    return this.deps.HashContent.hash(value);
  }
}
