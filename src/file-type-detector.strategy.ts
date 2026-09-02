import type * as tools from "@bgord/tools";

export const FileTypeDetectorPrefixLength = 12;

export interface FileTypeDetectorStrategy {
  detect(bytes: Uint8Array): tools.Mime | null;
}
