import type * as tools from "@bgord/tools";
import type { FileCopierPort } from "./file-copier.port";

export class FileCopierNoopAdapter implements FileCopierPort {
  async copy(
    _source: tools.FilePathRelative | tools.FilePathAbsolute | string,
    _destination: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void> {}
}
