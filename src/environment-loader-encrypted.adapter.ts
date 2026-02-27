import util from "node:util";
import type * as tools from "@bgord/tools";
import type * as z from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EncryptionPort } from "./encryption.port";
import type { EnvironmentLoaderPort, EnvironmentResultType } from "./environment-loader.port";

type Dependencies = { Encryption: EncryptionPort };

export class EnvironmentLoaderEncryptedAdapter<Schema extends z.ZodObject<any>>
  implements EnvironmentLoaderPort<Schema>
{
  constructor(
    private readonly config: {
      type: NodeEnvironmentEnum;
      Schema: Schema;
      path: tools.FilePathAbsolute | tools.FilePathRelative;
    },
    private readonly deps: Dependencies,
  ) {}

  async load(): Promise<Readonly<EnvironmentResultType<Schema>>> {
    const file = await this.deps.Encryption.view(this.config.path);
    const plaintext = new TextDecoder().decode(file);
    const env = util.parseEnv(plaintext);

    return Object.freeze({ ...this.config.Schema.parse(env), type: this.config.type });
  }
}
