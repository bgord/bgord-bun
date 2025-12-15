import type { z } from "zod/v4";
import { NodeEnvironment, type NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EnvironmentLoaderPort } from "./environment-loader.port";

export class EnvironmentLoaderProcessEnvAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  private readonly type: NodeEnvironmentEnum;
  private readonly schema: Schema;

  constructor(
    config: { type: typeof process.env.NODE_ENV; schema: Schema },
    private env: NodeJS.ProcessEnv,
  ) {
    this.schema = config.schema;
    this.type = NodeEnvironment.parse(config.type);
  }

  async load() {
    const result = this.schema.parse(this.env);

    for (const key of Object.keys(result)) {
      delete process.env[key];
    }

    return Object.freeze({ ...result, type: this.type });
  }
}
