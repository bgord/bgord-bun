import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { ReactiveConfigPort, ReactiveConfigSchema } from "./reactive-config.port";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

type Dependencies = { FileReaderJson: FileReaderJsonPort };

export class ReactiveConfigFileJsonAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly path: tools.FilePathAbsolute | tools.FilePathRelative,
    private readonly schema: ReactiveConfigSchema<T>,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<Readonly<T>> {
    const raw = await this.deps.FileReaderJson.read(this.path);

    return Object.freeze(StandardSchemaValidator.validate(this.schema, raw));
  }
}
