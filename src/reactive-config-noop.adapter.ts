import type { ReactiveConfigPort, ReactiveConfigSchema } from "./reactive-config.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class ReactiveConfigNoopAdapter<T extends object> implements ReactiveConfigPort<T> {
  private readonly value: Readonly<T>;

  constructor(schema: ReactiveConfigSchema<T>, value: T) {
    this.value = Object.freeze(StandardSchemaValidator.validate(schema, value));
  }

  async get(): Promise<Readonly<T>> {
    return this.value;
  }
}
