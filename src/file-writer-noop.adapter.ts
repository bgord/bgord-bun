import type * as tools from "@bgord/tools";
import type { FileWriterContent, FileWriterPort } from "./file-writer.port";

export class FileWriterNoopAdapter implements FileWriterPort {
  async write(
    _path: tools.FilePathRelative | tools.FilePathAbsolute | string,
    _content: FileWriterContent,
  ): Promise<void> {}
}
