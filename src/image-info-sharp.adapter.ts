import * as tools from "@bgord/tools";
import sharp from "sharp";
import type { ImageInfoPort } from "./image-info.port";

export class ImageInfoSharpAdapter implements ImageInfoPort {
  async inspect(filePath: tools.FilePathRelative | tools.FilePathAbsolute) {
    const path = filePath.get();

    const image = sharp(path);

    using _sharp_ = {
      [Symbol.dispose]: () => image.destroy(),
    };

    const metadata = await image.metadata();

    return {
      width: tools.ImageWidth.parse(metadata.width),
      height: tools.ImageHeight.parse(metadata.height),
      mime: tools.Mime.fromExtension(tools.Extension.parse(metadata.format)),
      size: tools.Size.fromBytes(Bun.file(path).size),
    };
  }
}
