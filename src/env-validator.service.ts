import { z } from "zod/v4";

import { NodeEnvironment } from "../src/node-env.vo";

type NodeEnvironmentEnumType = z.infer<typeof NodeEnvironment>;

type AnyZodSchema = z.ZodSchema<any, any>;
type QuitType = boolean;

type EnvironmentValidatorConfig = {
  type: unknown;
  schema: AnyZodSchema;
  quit?: QuitType;
};

export class EnvironmentValidator<SchemaType> {
  type: NodeEnvironmentEnumType;
  schema: z.Schema<SchemaType>;
  quit: QuitType;

  constructor(config: EnvironmentValidatorConfig) {
    this.schema = config.schema;
    this.quit = config?.quit ?? true;

    const result = NodeEnvironment.safeParse(config.type);

    if (result.success) {
      this.type = result.data;
    } else if (this.quit) {
      console.log(`Invalid EnvironmentType: ${config.type}`);
      process.exit(1);
    } else {
      throw new NodeEnvironmentError();
    }
  }

  load(): SchemaType & { type: NodeEnvironmentEnumType } {
    return { ...this.schema.parse(process.env), type: this.type };
  }
}

class NodeEnvironmentError extends Error {}
