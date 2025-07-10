import { z } from "zod";

export type IdType = string;

type UsernameType = string;

export class Username {
  private readonly schema: z.ZodSchema = z.string().max(256);

  private readonly value: UsernameType;

  constructor(value: UsernameType, schema?: z.ZodSchema) {
    this.schema = schema ?? this.schema;
    this.value = this.schema.parse(value) as UsernameType;
  }

  read(): UsernameType {
    return this.value;
  }
}
