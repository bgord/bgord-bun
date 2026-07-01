import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class EnvironmentLoaderNoopAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deterministic: Omit<EnvironmentResultType<T>, "type">,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    return Object.freeze({
      ...StandardSchemaValidator.validate(this.config.EnvironmentSchema, this.deterministic),
      type: this.config.type,
    });
  }
}
