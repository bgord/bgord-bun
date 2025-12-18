import type { z } from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { CacheResolverPort } from "./cache-resolver.port";
import { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "./cache-subject-segment-fixed";
import type { ContentHashPort } from "./content-hash.port";
import type { EnvironmentLoaderPort } from "./environment-loader.port";

type Dependencies = { CacheResolver: CacheResolverPort; ContentHash: ContentHashPort };

export class EnvironmentLoaderProcessSafeAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: { type: NodeEnvironmentEnum; Schema: Schema },
    private readonly deps: Dependencies,
  ) {}

  async load() {
    const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixed("env")], this.deps);
    const subject = await resolver.resolve();

    const result = await this.deps.CacheResolver.resolve(subject.hex, async () =>
      this.config.Schema.parse(this.env),
    );

    for (const key of Object.keys(result)) delete process.env[key];

    return Object.freeze({ ...result, type: this.config.type });
  }
}
