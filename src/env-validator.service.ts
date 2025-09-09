import type { z } from "zod/v4";
import type { LoggerPort } from "../src/logger.port";
import { NodeEnvironment } from "../src/node-env.vo";

type NodeEnvironmentEnumType = z.infer<typeof NodeEnvironment>;

type AnyZodSchema = z.ZodSchema<any, any>;

type EnvironmentValidatorConfig = { type: unknown; schema: AnyZodSchema; logger: LoggerPort };

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

    config.logger.error({
      message: "Invalid EnvironmentType",
      component: "infra",
      operation: "env_validator",
      error: { message: `Invalid EnvironmentType: ${config.type}` },
    });
    process.exit(1);
  }

  load(): SchemaType & { type: NodeEnvironmentEnumType } {
    return { ...this.schema.parse(process.env), type: this.type };
  }
}
