import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export class EnvironmentLoaderProcessSafeAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private env: NodeJS.ProcessEnv,
    private readonly config: EnvironmentLoaderConfig<T>,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const parsed = StandardSchemaValidator.validate(this.config.EnvironmentSchema, this.env);

    for (const key of Object.keys(parsed)) {
      delete this.env[key];
      delete process.env[key];
    }

    return Object.freeze(Object.assign({}, parsed, { type: this.config.type }));
  }
}
