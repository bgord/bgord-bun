import type * as tools from "@bgord/tools";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { CacheValueType } from "./cache-value.vo";
import type { ClockPort } from "./clock.port";
import type { Hash } from "./hash.vo";

type CacheRepositoryEntry = { value: string; expiresAt: tools.Timestamp | null };

type Dependencies = { Clock: ClockPort };

export class CacheRepositoryInMemoryAdapter implements CacheRepositoryPort {
  private static readonly CAPACITY = 100_000;

  private readonly store = new Map<string, CacheRepositoryEntry>();

  constructor(
    private readonly config: CacheRepositoryTtlType,
    private readonly deps: Dependencies,
  ) {}

  async get(subject: Hash): Promise<CacheValueType | null> {
    const entry = this.store.get(subject.get());

    if (entry === undefined) return null;

    if (entry.expiresAt?.isBefore(this.deps.Clock.now())) return null;

    return JSON.parse(entry.value);
  }

  async set(subject: Hash, value: CacheValueType): Promise<void> {
    const expiresAt = this.config.type === "finite" ? this.deps.Clock.now().add(this.config.ttl) : null;

    try {
      this.store.delete(subject.get());

      if (this.store.size >= CacheRepositoryInMemoryAdapter.CAPACITY) {
        this.store.delete(this.store.keys().next().value as string);
      }

      this.store.set(subject.get(), { value: JSON.stringify(value), expiresAt });
    } catch {}
  }

  async delete(subject: Hash): Promise<void> {
    this.store.delete(subject.get());
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}
