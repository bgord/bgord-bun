import type { z } from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EnvironmentLoaderPort, EnvironmentResultType } from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  private cached: Readonly<EnvironmentResultType<Schema>> | null = null;

  constructor(
    private readonly config: { type: NodeEnvironmentEnum; Schema: Schema },
    private env: NodeJS.ProcessEnv,
  ) {}

  async load() {
    if (this.cached) return this.cached;

    const result = this.config.Schema.parse(this.env);

    for (const key of Object.keys(result)) delete process.env[key];

    this.cached = Object.freeze({ ...result, type: this.config.type });

    return this.cached;
  }
}
