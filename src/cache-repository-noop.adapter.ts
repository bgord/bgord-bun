import type * as tools from "@bgord/tools";
import type { CacheRepositoryPort } from "./cache-repository.port";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  constructor(_config: { ttl: tools.Duration }) {}

  async get<T>(): Promise<T | null> {
    return null;
  }

  async set() {}

  async delete() {}

  async flush() {}
}
