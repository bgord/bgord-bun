import {
  type EnvironmentLoaderConfig,
  EnvironmentLoaderError,
  type EnvironmentLoaderPort,
  type EnvironmentResultType,
} from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const result = this.config.EnvironmentSchema["~standard"].validate(this.env);
    if (result instanceof Promise) throw new Error(EnvironmentLoaderError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return Object.freeze({ ...result.value, type: this.config.type });
  }
}
