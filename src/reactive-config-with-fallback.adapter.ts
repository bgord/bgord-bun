import type { ReactiveConfigPort, ReactiveConfigSchema } from "./reactive-config.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class ReactiveConfigWithFallbackAdapter<T extends object> implements ReactiveConfigPort<T> {
  private readonly fallback: Readonly<T>;

  constructor(
    private readonly inner: ReactiveConfigPort<T>,
    schema: ReactiveConfigSchema<T>,
    fallback: T,
  ) {
    this.fallback = Object.freeze(StandardSchemaValidator.validate(schema, fallback));
  }

  async get(): Promise<Readonly<T>> {
    try {
      return await this.inner.get();
    } catch {
      return this.fallback;
    }
  }
}
