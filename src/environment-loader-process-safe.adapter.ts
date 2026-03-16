import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import {
  type EnvironmentLoaderConfig,
  EnvironmentLoaderError,
  type EnvironmentLoaderPort,
  type EnvironmentResultType,
} from "./environment-loader.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class EnvironmentLoaderProcessSafeAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deps: Dependencies,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("env")], this.deps);
    const subject = await resolver.resolve();

    const parsed = await this.deps.CacheResolver.resolve(subject.hex, async () => {
      const result = this.config.EnvironmentSchema["~standard"].validate(this.env);
      if (result instanceof Promise) throw new Error(EnvironmentLoaderError.NoAsyncSchema);
      // Stryker disable next-line OptionalChaining
      if (result.issues) throw new Error(result.issues[0]?.message);
      return result.value;
    });

    for (const key of Object.keys(parsed)) delete process.env[key];

    return Object.freeze({ ...parsed, type: this.config.type });
  }
}
