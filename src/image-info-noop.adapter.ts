import * as tools from "@bgord/tools";
import type { ImageInfoPort } from "./image-info.port";

export class ImageInfoNoopAdapter implements ImageInfoPort {
  constructor(private readonly mime: tools.Mime) {}

  async inspect(_filePath: tools.FilePathRelative | tools.FilePathAbsolute) {
    return {
      width: tools.ImageWidth.parse(400),
      height: tools.ImageHeight.parse(400),
      mime: this.mime,
      size: tools.Size.fromBytes(0),
    };
  }
}
