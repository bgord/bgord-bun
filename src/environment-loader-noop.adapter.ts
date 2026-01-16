import type { z } from "zod/v4";
import type { NodeEnvironmentType } from "../src/node-env.vo";
import type { EnvironmentLoaderPort, EnvironmentResultType } from "./environment-loader.port";

export class EnvironmentLoaderNoopAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  constructor(
    private readonly config: { type: NodeEnvironmentType; Schema: Schema },
    private readonly deterministic: Omit<EnvironmentResultType<Schema>, "type">,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<Schema>>> {
    return Object.freeze({ ...this.config.Schema.parse(this.deterministic), type: this.config.type });
  }
}
