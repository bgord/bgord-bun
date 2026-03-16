import {
  type EnvironmentLoaderConfig,
  EnvironmentLoaderError,
  type EnvironmentLoaderPort,
  type EnvironmentResultType,
} from "./environment-loader.port";

export class EnvironmentLoaderNoopAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deterministic: Omit<EnvironmentResultType<T>, "type">,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const result = this.config.EnvironmentSchema["~standard"].validate(this.deterministic);
    if (result instanceof Promise) throw new Error(EnvironmentLoaderError.NoAsyncSchema);
    // Stryker disable next-line OptionalChaining
    if (result.issues) throw new Error(result.issues[0]?.message);
    return Object.freeze({ ...result.value, type: this.config.type });
  }
}
