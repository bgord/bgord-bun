import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";

type FileInspectionNoopAdapterConfigType = {
  exists: boolean;
  isDirectory?: boolean;
  permissions?: { read?: boolean; write?: boolean; execute?: boolean };
  size?: tools.Size;
  lastModified?: tools.Timestamp;
};

export class FileInspectionNoopAdapter implements FileInspectionPort {
  constructor(private readonly config: FileInspectionNoopAdapterConfigType) {}

  async exists(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.exists;
  }

  async isDirectory(
    _path: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType,
  ): Promise<boolean> {
    return this.config.isDirectory ?? true;
  }

  async canRead(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.permissions?.read ?? true;
  }
  async canWrite(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.permissions?.write ?? true;
  }
  async canExecute(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return this.config.permissions?.execute ?? true;
  }

  async size(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<tools.Size> {
    return this.config.size ?? tools.Size.fromMB(1);
  }

  async lastModified(
    _path: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<tools.Timestamp> {
    return this.config.lastModified ?? tools.Timestamp.fromNumber(0);
  }
}
