import type * as tools from "@bgord/tools";
import type { JsonFileReaderPort } from "./file-reader-json.port";

export class JsonFileReaderBunAdapter implements JsonFileReaderPort {
  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>> {
    return Bun.file(typeof path === "string" ? path : path.get()).json();
  }
}
