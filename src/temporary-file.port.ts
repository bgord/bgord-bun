import type * as tools from "@bgord/tools";

export interface TemporaryFilePort {
  write(filename: tools.Filename, content: File): Promise<{ path: tools.FilePathAbsolute }>;

  cleanup(filename: tools.Filename): Promise<void>;
}
