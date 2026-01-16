import type { z } from "zod/v4";
import type { NodeEnvironmentType } from "../src/node-env.vo";
import type { EnvironmentLoaderPort } from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  constructor(
    private readonly config: { type: NodeEnvironmentType; Schema: Schema },
    private env: NodeJS.ProcessEnv,
  ) {}

  async load() {
    return Object.freeze({ ...this.config.Schema.parse(this.env), type: this.config.type });
  }
}
