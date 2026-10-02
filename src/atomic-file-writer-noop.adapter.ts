import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { FileWriterContent } from "./file-writer.port";

export class AtomicFileWriterNoopAdapter implements AtomicFileWriterPort {
  async write(
    _path: tools.FilePathRelative | tools.FilePathAbsolute,
    _content: FileWriterContent,
  ): Promise<void> {}
}
