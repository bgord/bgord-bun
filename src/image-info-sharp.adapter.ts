import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

type Dependencies = { FileInspection: FileInspectionPort; MimeRegistry: tools.MimeRegistry };

export class ImageInfoSharpAdapter implements ImageInfoPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name
    return (await import(name)).default;
  }

  async inspect(path: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    const size = await this.deps.FileInspection.size(path);

    const sharp = await this.load();

    const pipeline = sharp(path.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    const metadata = await pipeline.metadata();

    const width = tools.ImageWidth.parse(metadata.width);
    const height = tools.ImageHeight.parse(metadata.height);
    const extension = tools.Extension.parse(metadata.format);
    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    return { width, height, mime, size };
  }
}
