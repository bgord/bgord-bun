import type * as tools from "@bgord/tools";
import type { FileReaderJsonOutputType, FileReaderJsonPort } from "./file-reader-json.port";

export class FileReaderJsonAdapter implements FileReaderJsonPort {
  async read(
    path: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<FileReaderJsonOutputType> {
    return Bun.file(typeof path === "string" ? path : path.get()).json();
  }
}
