import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
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

    const result = await this.deps.CacheResolver.resolve(subject.hex, async () =>
      this.config.EnvironmentSchema.parse(this.env),
    );

    for (const key of Object.keys(result)) delete process.env[key];

    return Object.freeze({ ...result, type: this.config.type });
  }
}
