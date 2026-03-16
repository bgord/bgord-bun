import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";

export class EnvironmentLoaderProcessAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    return Object.freeze({ ...this.config.EnvironmentSchema.parse(this.env), type: this.config.type });
  }
}
