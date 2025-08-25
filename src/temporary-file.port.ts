import type * as tools from "@bgord/tools";

export interface TemporaryFilePort {
  write(path: tools.AbsoluteFilePath): Promise<{ path: tools.AbsoluteFilePath }>;

  cleanup(path: tools.AbsoluteFilePath): Promise<void>;
}
