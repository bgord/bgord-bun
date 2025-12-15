import type { z } from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EnvironmentLoaderPort } from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  constructor(
    private readonly config: { type: NodeEnvironmentEnum; Schema: Schema },
    private env: NodeJS.ProcessEnv,
  ) {}

  async load() {
    const result = this.config.Schema.parse(this.env);

    for (const key of Object.keys(result)) {
      delete process.env[key];
    }

    return Object.freeze({ ...result, type: this.config.type });
  }
}
