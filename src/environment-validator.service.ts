import type { z } from "zod/v4";
import { NodeEnvironment, type NodeEnvironmentEnum } from "../src/node-env.vo";

export const EnvironmentValidatorError = { Invalid: "environment.validator.invalid" } as const;

export class EnvironmentValidator<Schema extends z.ZodObject<any>> {
  private readonly type: NodeEnvironmentEnum;
  private readonly schema: Schema;

  constructor(config: { type: string | undefined; schema: Schema }) {
    this.schema = config.schema;

    const result = NodeEnvironment.safeParse(config.type);

    if (!result.success) throw new Error(EnvironmentValidatorError.Invalid);

    this.type = result.data;
  }

  load(): z.infer<Schema> & { type: NodeEnvironmentEnum } {
    return { ...this.schema.parse(process.env), type: this.type };
  }
}
