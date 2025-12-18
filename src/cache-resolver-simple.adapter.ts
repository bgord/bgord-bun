import type { CacheRepositoryPort } from "./cache-repository.port";
import { type CacheResolverPort, CacheSourceEnum } from "./cache-resolver.port";
import type { CacheSubjectType } from "./cache-subject.vo";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class CacheResolverSimpleAdapter implements CacheResolverPort {
  constructor(private readonly deps: Dependencies) {}

  async resolve<T>(subject: CacheSubjectType, producer: () => Promise<T>): Promise<T> {
    const result = await this.resolveWithContext(subject, producer);

    return result.value;
  }

  async resolveWithContext<T>(
    subject: CacheSubjectType,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }> {
    const cached = await this.deps.CacheRepository.get<T>(subject);

    if (cached !== null) return { value: cached, source: CacheSourceEnum.hit };

    const value = await producer();
    await this.deps.CacheRepository.set(subject, value);

    return { value, source: CacheSourceEnum.miss };
  }

  async flush() {
    await this.deps.CacheRepository.flush();
  }

  get ttl() {
    return this.deps.CacheRepository.ttl;
  }
}
