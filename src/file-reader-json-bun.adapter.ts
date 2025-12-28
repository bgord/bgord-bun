import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";

export class JsonFileReaderBunAdapter implements FileReaderJsonPort {
  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>> {
    return Bun.file(typeof path === "string" ? path : path.get()).json();
  }
}
