import type { z } from "zod/v4";
import { NodeEnvironment, type NodeEnvironmentEnum } from "../src/node-env.vo";

export class EnvironmentValidator<Schema extends z.ZodObject<any>> {
  private readonly type: NodeEnvironmentEnum;
  private readonly schema: Schema;

  constructor(config: { type: string | undefined; schema: Schema }) {
    this.schema = config.schema;
    this.type = NodeEnvironment.parse(config.type);
  }

  load(env: NodeJS.ProcessEnv): z.infer<Schema> & { type: NodeEnvironmentEnum } {
    return { ...this.schema.parse(env), type: this.type };
  }
}
