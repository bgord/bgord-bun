import * as tools from "@bgord/tools";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

type Dependencies = { MimeRegistry: tools.MimeRegistry };

export class ImageInfoSharpAdapter implements ImageInfoPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name
    return (await import(name)).default;
  }

  async inspect(filePath: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    const sharp = await this.load();

    const path = filePath.get();

    const pipeline = sharp(path);
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    const metadata = await pipeline.metadata();

    const extension = tools.Extension.parse(metadata.format);
    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    return {
      width: tools.ImageWidth.parse(metadata.width),
      height: tools.ImageHeight.parse(metadata.height),
      mime,
      size: tools.Size.fromBytes(Bun.file(path).size),
    };
  }
}
