import { access, constants, stat } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";

export class FileInspectionAdapter implements FileInspectionPort {
  async exists(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    return Bun.file(typeof path === "string" ? path : path.get()).exists();
  }

  async isDirectory(
    path: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType,
  ): Promise<boolean> {
    try {
      const node = await stat(path);

      return node.isDirectory();
    } catch {
      return false;
    }
  }

  async canRead(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    try {
      await access(typeof path === "string" ? path : path.get(), constants.R_OK);

      return true;
    } catch {
      return false;
    }
  }

  async canWrite(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    try {
      await access(typeof path === "string" ? path : path.get(), constants.W_OK);

      return true;
    } catch {
      return false;
    }
  }

  async canExecute(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean> {
    try {
      await access(typeof path === "string" ? path : path.get(), constants.X_OK);

      return true;
    } catch {
      return false;
    }
  }
}
