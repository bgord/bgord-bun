import type { z } from "zod/v4";
import { NodeEnvironment, type NodeEnvironmentEnum } from "../src/node-env.vo";

type AnyZodSchema = z.ZodSchema<any, any>;
type EnvironmentValidatorConfig = { type: unknown; schema: AnyZodSchema };

export type EnvironmentResultType<SchemaType> = SchemaType & { type: NodeEnvironmentEnum };

export const EnvironmentValidatorError = { Invalid: "environment.validator.invalid" } as const;

export class EnvironmentValidator<SchemaType> {
  type: NodeEnvironmentEnum;
  schema: z.Schema<SchemaType>;

  constructor(config: EnvironmentValidatorConfig) {
    this.schema = config.schema;

    const result = NodeEnvironment.safeParse(config.type);

    if (result.success) {
      this.type = result.data;
      return;
    }

    throw new Error(EnvironmentValidatorError.Invalid);
  }

  load(): EnvironmentResultType<SchemaType> {
    return { ...this.schema.parse(process.env), type: this.type };
  }
}
