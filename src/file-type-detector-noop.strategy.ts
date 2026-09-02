import type * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

export class FileTypeDetectorNoopStrategy implements FileTypeDetectorStrategy {
  constructor(private readonly mime: tools.Mime | null = null) {}

  detect(_bytes: Uint8Array): tools.Mime | null {
    return this.mime;
  }
}
