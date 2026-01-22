import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";

type FileInspectionNoopAdapterConfigType = {
  exists: boolean;
  requirements?: { read: boolean; write: boolean; execute: boolean };
};

export class FileInspectionNoopAdapter implements FileInspectionPort {
  constructor(private readonly config: FileInspectionNoopAdapterConfigType) {}

  async exists(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.exists;
  }

  async canRead(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.requirements?.read ?? true;
  }
  async canWrite(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.requirements?.write ?? true;
  }
  async canExecute(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.requirements?.execute ?? true;
  }
}
