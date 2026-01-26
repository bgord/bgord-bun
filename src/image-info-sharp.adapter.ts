import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

export const ImageInfoSharpAdapterError = {
  MissingDependency: "image.info.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileInspection: FileInspectionPort; MimeRegistry: tools.MimeRegistry };
type SharpConstructor = typeof import("sharp");

export class ImageInfoSharpAdapter implements ImageInfoPort {
  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageInfoSharpAdapter> {
    return new ImageInfoSharpAdapter(await ImageInfoSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageInfoSharpAdapter.import();
    } catch {
      throw new Error(ImageInfoSharpAdapterError.MissingDependency);
    }
  }

  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }

  async inspect(path: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    const size = await this.deps.FileInspection.size(path);

    const pipeline = this.sharp(path.get());
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
