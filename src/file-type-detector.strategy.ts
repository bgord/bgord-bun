import type * as tools from "@bgord/tools";

export interface FileTypeDetectorStrategy {
  detect(file: File): Promise<tools.Mime | null>;
}
