import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { FileWriterContent } from "./file-writer.port";

export class AtomicFileWriterCollectingAdapter implements AtomicFileWriterPort {
  readonly written: Array<[tools.FilePathRelative | tools.FilePathAbsolute, FileWriterContent]> = [];

  async write(
    path: tools.FilePathRelative | tools.FilePathAbsolute,
    content: FileWriterContent,
  ): Promise<void> {
    this.written.push([path, content]);
  }
}
