import type * as tools from "@bgord/tools";
import type { FileWriterContent } from "./file-writer.port";

export interface AtomicFileWriterPort {
  write(path: tools.FilePathRelative | tools.FilePathAbsolute, content: FileWriterContent): Promise<void>;
}
