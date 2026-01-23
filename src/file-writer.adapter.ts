import type * as tools from "@bgord/tools";
import type { FileWriterContent, FileWriterPort } from "./file-writer.port";

export class FileWriterAdapter implements FileWriterPort {
  async write(
    path: tools.FilePathRelative | tools.FilePathAbsolute | string,
    content: FileWriterContent,
  ): Promise<void> {
    // Types are different than the runtime behavior
    await Bun.write(typeof path === "string" ? path : path.get(), content as any);
  }
}
