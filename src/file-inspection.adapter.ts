import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";

export class FileInspectionAdapter implements FileInspectionPort {
  async exists(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return Bun.file(typeof path === "string" ? path : path.get()).exists();
  }
}
