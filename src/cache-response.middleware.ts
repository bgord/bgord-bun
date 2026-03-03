import type { CacheResolverStrategy, CacheSourceEnum } from "./cache-resolver.strategy";
import type { RequestContext } from "./request-context.port";
import type { SubjectRequestResolver } from "./subject-request-resolver.vo";

type Dependencies = { CacheResolver: CacheResolverStrategy };

export type CacheResponseConfig = { enabled: boolean; resolver: SubjectRequestResolver };

export type CachedResponse<T = string> = {
  body: T;
  headers: Record<string, string>;
  status: number;
};

export type CacheResponseResult<T = string> = {
  response: CachedResponse<T>;
  source: CacheSourceEnum;
};

export class CacheResponseMiddleware {
  static readonly CACHE_HIT_HEADER = "Cache-Hit";

  constructor(
    private readonly config: CacheResponseConfig,
    private readonly deps: Dependencies,
  ) {}

  async evaluate<T = string>(
    context: RequestContext,
    generateResponse: () => Promise<CachedResponse<T>>,
  ): Promise<CacheResponseResult<T> | null> {
    if (!this.config.enabled) return null;

    const subject = await this.config.resolver.resolve(context);

    const result = await this.deps.CacheResolver.resolveWithContext<CachedResponse<T>>(
      subject.hex,
      generateResponse,
    );

    return {
      response: result.value,
      source: result.source,
    };
  }

  async clear(): Promise<void> {
    await this.deps.CacheResolver.flush();
  }
}
