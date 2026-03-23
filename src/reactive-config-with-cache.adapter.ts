import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { ReactiveConfigPort } from "./reactive-config.port";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class ReactiveConfigWithCacheAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly inner: ReactiveConfigPort<T>,
    private readonly subject: string,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<Readonly<T>> {
    const key = await this.deps.HashContent.hash(this.subject);

    return this.deps.CacheResolver.resolve(key, () => this.inner.get());
  }
}
