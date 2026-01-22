import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";

type FileInspectionNoopAdapterConfigType = { exists: boolean };

export class FileInspectionNoopAdapter implements FileInspectionPort {
  constructor(private readonly config: FileInspectionNoopAdapterConfigType) {}

  async exists(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.exists;
  }
}
