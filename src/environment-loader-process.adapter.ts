import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class EnvironmentLoaderProcessAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    return Object.freeze({
      ...StandardSchemaValidator.validate(this.config.EnvironmentSchema, this.env),
      type: this.config.type,
    });
  }
}
