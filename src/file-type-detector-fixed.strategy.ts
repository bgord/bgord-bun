import type * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

export class FileTypeDetectorFixedStrategy implements FileTypeDetectorStrategy {
  constructor(private readonly mime: tools.Mime | null) {}

  detect(_bytes: Uint8Array): tools.Mime | null {
    return this.mime;
  }
}
