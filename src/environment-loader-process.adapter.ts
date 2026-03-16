import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private readonly config: EnvironmentLoaderConfig<T>,
    private env: NodeJS.ProcessEnv,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    return Object.freeze({ ...this.config.EnvironmentSchema.parse(this.env), type: this.config.type });
  }
}
