import util from "node:util";
import type * as tools from "@bgord/tools";
import type { EncryptionPort } from "./encryption.port";
import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

type Dependencies = { Encryption: EncryptionPort };

export class EnvironmentLoaderEncryptedAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  constructor(
    private readonly path: tools.FilePathAbsolute | tools.FilePathRelative,
    private readonly config: EnvironmentLoaderConfig<T>,
    private readonly deps: Dependencies,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    const file = await this.deps.Encryption.view(this.path);
    const plaintext = new TextDecoder().decode(file);
    const env = util.parseEnv(plaintext);

    return Object.freeze({
      ...StandardSchemaValidator.validate(this.config.EnvironmentSchema, env),
      type: this.config.type,
    });
  }
}
