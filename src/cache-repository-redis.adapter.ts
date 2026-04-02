import type { RedisClient } from "bun";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { Hash } from "./hash.vo";

export class CacheRepositoryRedisAdapter implements CacheRepositoryPort {
  constructor(
    private readonly client: RedisClient,
    private readonly config: CacheRepositoryTtlType,
  ) {}

  async get<T>(subject: Hash): Promise<T | null> {
    const value = await this.client.get(subject.get());
    if (value === null) return null;
    return JSON.parse(value) as T;
  }

  async set<T>(subject: Hash, value: T): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.config.type === "finite") {
      await this.client.setex(subject.get(), this.config.ttl.seconds, serialized);
    } else {
      await this.client.set(subject.get(), serialized);
    }
  }

  async delete(subject: Hash): Promise<void> {
    await this.client.del(subject.get());
  }

  async flush(): Promise<void> {
    await this.client.send("FLUSHDB", []);
  }
}
