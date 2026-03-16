import util from "node:util";
import type * as tools from "@bgord/tools";
import type { EncryptionPort } from "./encryption.port";
import {
  type EnvironmentLoaderConfig,
  EnvironmentLoaderError,
  type EnvironmentLoaderPort,
  type EnvironmentResultType,
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

    const result = this.config.EnvironmentSchema["~standard"].validate(env);
    if (result instanceof Promise) throw new Error(EnvironmentLoaderError.NoAsyncSchema);
    // Stryker disable next-line OptionalChaining
    if (result.issues) throw new Error(result.issues[0]?.message);
    return Object.freeze({ ...result.value, type: this.config.type });
  }
}
