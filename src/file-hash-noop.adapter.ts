import * as tools from "@bgord/tools";
import type { FileHashPort, FileHashResult } from "./file-hash.port";

export class FileHashNoopAdapter implements FileHashPort {
  async hash(_path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult> {
    return { hex: "noop", size: tools.Size.fromBytes(0) };
  }
}
