import type * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

export const FileTypeDetectorCompositeError = { NoStrategies: "file.type.detector.composite.strategies.min" };

export class FileTypeDetectorCompositeStrategy implements FileTypeDetectorStrategy {
  constructor(private readonly strategies: ReadonlyArray<FileTypeDetectorStrategy>) {
    if (this.strategies.length === 0) throw new Error(FileTypeDetectorCompositeError.NoStrategies);
  }

  async detect(file: File): Promise<tools.Mime | null> {
    for (const strategy of this.strategies) {
      const mime = await strategy.detect(file);

      if (mime) return mime;
    }

    return null;
  }
}
