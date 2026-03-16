import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";

export class EnvironmentLoaderNoopAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deterministic: Omit<EnvironmentResultType<T>, "type">,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    return Object.freeze({
      ...this.config.EnvironmentSchema.parse(this.deterministic),
      type: this.config.type,
    });
  }
}
