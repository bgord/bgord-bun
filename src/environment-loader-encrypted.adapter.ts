import type * as tools from "@bgord/tools";
import { parse } from "dotenv";
import type { z } from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EncryptionPort } from "./encryption.port";
import type { EnvironmentLoaderPort } from "./environment-loader.port";

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

  async load() {
    const file = await this.deps.Encryption.view(this.config.path);
    const content = new TextDecoder().decode(file);

    return Object.freeze({ ...this.config.Schema.parse(parse(content)), type: this.config.type });
  }
}
