import { CacheCodecIdentityStrategy } from "./cache-codec-identity.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheValueType } from "./cache-value.vo";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { ReactiveConfigPort } from "./reactive-config.port";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class ReactiveConfigWithCacheAdapter<T extends object & CacheValueType>
  implements ReactiveConfigPort<T>
{
  private readonly codec = new CacheCodecIdentityStrategy<T>();

  constructor(
    private readonly inner: ReactiveConfigPort<T>,
    private readonly subject: string,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<Readonly<T>> {
    const key = await this.deps.HashContent.hash(this.subject);

    return Object.freeze(await this.deps.CacheResolver.resolve<T>(key, () => this.inner.get(), this.codec));
  }
}
