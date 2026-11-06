import * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

export class FileTypeDetectorSvgStrategy implements FileTypeDetectorStrategy {
  async detect(file: File): Promise<tools.Mime | null> {
    const text = new TextDecoder().decode(await file.slice(0, 1445).arrayBuffer());

    return text.trimStart().startsWith("<svg") ? tools.Mimes.svg.mime : null;
  }
}
