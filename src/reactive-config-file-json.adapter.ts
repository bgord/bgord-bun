import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import {
  ReactiveConfigError,
  type ReactiveConfigPort,
  type ReactiveConfigSchema,
} from "./reactive-config.port";

type Dependencies = { FileReaderJson: FileReaderJsonPort };

export class ReactiveConfigFileJsonAdapter<T extends object> implements ReactiveConfigPort<T> {
  constructor(
    private readonly path: tools.FilePathAbsolute | tools.FilePathRelative,
    private readonly schema: ReactiveConfigSchema<T>,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<Readonly<T>> {
    const raw = await this.deps.FileReaderJson.read(this.path);

    const result = this.schema["~standard"].validate(raw);
    if (result instanceof Promise) throw new Error(ReactiveConfigError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return Object.freeze(result.value);
  }
}
