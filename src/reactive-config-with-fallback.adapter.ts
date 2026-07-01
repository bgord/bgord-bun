import type { ReactiveConfigPort, ReactiveConfigSchema } from "./reactive-config.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class ReactiveConfigWithFallbackAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly inner: ReactiveConfigPort<T>,
    private readonly schema: ReactiveConfigSchema<T>,
    private readonly fallback: T,
  ) {}

  async get(): Promise<Readonly<T>> {
    try {
      return await this.inner.get();
    } catch {
      return Object.freeze(StandardSchemaValidator.validate(this.schema, this.fallback));
    }
  }
}
