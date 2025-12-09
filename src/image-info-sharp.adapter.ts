import * as tools from "@bgord/tools";
import type { ImageInfoPort } from "./image-info.port";

export class ImageInfoSharpAdapter implements ImageInfoPort {
  private async load() {
    const name = "sharp"; // Bun does not resolve dynamic imports with a dynamic name
    return (await import(name)).default;
  }

  async inspect(filePath: tools.FilePathRelative | tools.FilePathAbsolute) {
    const sharp = await this.load();

    const path = filePath.get();

    const pipeline = sharp(path);
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    const metadata = await pipeline.metadata();

    return {
      width: tools.ImageWidth.parse(metadata.width),
      height: tools.ImageHeight.parse(metadata.height),
      mime: tools.Mime.fromExtension(tools.Extension.parse(metadata.format)),
      size: tools.Size.fromBytes(Bun.file(path).size),
    };
  }
}
