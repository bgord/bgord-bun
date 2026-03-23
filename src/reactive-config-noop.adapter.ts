import {
  ReactiveConfigError,
  type ReactiveConfigPort,
  type ReactiveConfigSchema,
} from "./reactive-config.port";

export class ReactiveConfigNoopAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly schema: ReactiveConfigSchema<T>,
    private readonly value: T,
  ) {}

  async get(): Promise<Readonly<T>> {
    const result = this.schema["~standard"].validate(this.value);
    if (result instanceof Promise) throw new Error(ReactiveConfigError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return Object.freeze(result.value);
  }
}
