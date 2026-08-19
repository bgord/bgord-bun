// [BUN DEPENDENCY]
// cSpell:ignore setex
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { CacheValueType } from "./cache-value.vo";
import type { Hash } from "./hash.vo";

export class CacheRepositoryRedisAdapter implements CacheRepositoryPort {
  constructor(
    private readonly client: Bun.RedisClient,
    private readonly config: CacheRepositoryTtlType,
  ) {}

  async get(subject: Hash): Promise<CacheValueType | null> {
    const value = await this.client.get(subject.get());
    if (value === null) return null;
    return JSON.parse(value);
  }

  async set(subject: Hash, value: CacheValueType): Promise<void> {
    const serialized = JSON.stringify(value);

    try {
      if (this.config.type === "finite") {
        await this.client.setex(subject.get(), this.config.ttl.seconds, serialized);
      } else {
        await this.client.set(subject.get(), serialized);
      }
    } catch {}
  }

  async delete(subject: Hash): Promise<void> {
    await this.client.del(subject.get());
  }

  async flush(): Promise<void> {
    await this.client.send("FLUSHDB", []);
  }
}
