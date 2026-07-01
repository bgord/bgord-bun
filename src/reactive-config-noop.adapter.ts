import type { ReactiveConfigPort, ReactiveConfigSchema } from "./reactive-config.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class ReactiveConfigNoopAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly schema: ReactiveConfigSchema<T>,
    private readonly value: T,
  ) {}

  async get(): Promise<Readonly<T>> {
    return Object.freeze(StandardSchemaValidator.validate(this.schema, this.value));
  }
}
