import util from "node:util";
import type * as tools from "@bgord/tools";
import type { EncryptionPort } from "./encryption.port";
import type {
  EnvironmentLoaderConfig,
  EnvironmentLoaderPort,
  EnvironmentResultType,
} from "./environment-loader.port";

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

    return Object.freeze({ ...this.config.EnvironmentSchema.parse(env), type: this.config.type });
  }
}
