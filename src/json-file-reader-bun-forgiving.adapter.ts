import type * as tools from "@bgord/tools";
import type { JsonFileReaderPort } from "./json-file-reader.port";

export class JsonFileReaderBunForgivingAdapter implements JsonFileReaderPort {
  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>> {
    try {
      return Bun.file(typeof path === "string" ? path : path.get()).json();
    } catch {
      return {};
    }
  }
}
