import type * as tools from "@bgord/tools";

export interface TemporaryFilePort {
  write(filename: tools.Filename, data: File): Promise<{ path: tools.FilePathAbsolute }>;
  cleanup(filename: tools.Filename): Promise<void>;
}
