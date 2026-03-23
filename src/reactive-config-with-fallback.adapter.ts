import {
  ReactiveConfigError,
  type ReactiveConfigPort,
  type ReactiveConfigSchema,
} from "./reactive-config.port";

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
      const result = this.schema["~standard"].validate(this.fallback);
      if (result instanceof Promise) throw new Error(ReactiveConfigError.NoAsyncSchema);
      if (result.issues) throw new Error(result.issues[0]?.message);
      return Object.freeze(result.value);
    }
  }
}
