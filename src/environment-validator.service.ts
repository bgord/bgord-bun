import type { z } from "zod/v4";
import { NodeEnvironment } from "../src/node-env.vo";

type NodeEnvironmentEnumType = z.infer<typeof NodeEnvironment>;
type AnyZodSchema = z.ZodSchema<any, any>;
type EnvironmentValidatorConfig = { type: unknown; schema: AnyZodSchema };

export const EnvironmentValidatorError = { Invalid: "environment.validator.invalid" } as const;

export class EnvironmentValidator<SchemaType> {
  type: NodeEnvironmentEnumType;
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

  load(): SchemaType & { type: NodeEnvironmentEnumType } {
    return { ...this.schema.parse(process.env), type: this.type };
  }
}
