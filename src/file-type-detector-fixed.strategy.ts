import type * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

export class FileTypeDetectorFixedStrategy implements FileTypeDetectorStrategy {
  constructor(private readonly mime: tools.Mime | null) {}

  async detect(_file: File): Promise<tools.Mime | null> {
    return this.mime;
  }
}
