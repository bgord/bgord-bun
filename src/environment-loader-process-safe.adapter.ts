import { CacheCodecIdentityStrategy } from "./cache-codec-identity.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheValueType } from "./cache-value.vo";
import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import { StandardSchemaValidator } from "./standard-schema-validator.service";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class EnvironmentLoaderProcessSafeAdapter<T extends object & CacheValueType>
  implements EnvironmentLoaderPort<T>
{
  private readonly codec = new CacheCodecIdentityStrategy<T>();

  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deps: Dependencies,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("env")], this.deps);
    const subject = await resolver.resolve();

    const parsed = await this.deps.CacheResolver.resolve<T>(
      subject.hex,
      async () => StandardSchemaValidator.validate(this.config.EnvironmentSchema, this.env),
      this.codec,
    );

    for (const key of Object.keys(parsed)) {
      delete this.env[key];
      delete process.env[key];
    }

    return Object.freeze(Object.assign({}, parsed, { type: this.config.type }));
  }
}
