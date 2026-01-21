import type * as tools from "@bgord/tools";

export interface TemporaryFilePort {
  write(filename: tools.Filename, content: File): Promise<tools.FilePathAbsolute>;

  cleanup(filename: tools.Filename): Promise<void>;

  get root(): tools.DirectoryPathAbsoluteType;
}
