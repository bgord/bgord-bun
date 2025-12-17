import type { CacheRepositoryPort } from "./cache-repository.port";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  async get() {
    return null;
  }

  async set() {}

  async delete() {}

  async flush() {}
}
