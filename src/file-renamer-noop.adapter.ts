import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";

export class FileRenamerNoopAdapter implements FileRenamerPort {
  async rename(
    _input: tools.FilePathRelative | tools.FilePathAbsolute | string,
    _output: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void> {}
}
