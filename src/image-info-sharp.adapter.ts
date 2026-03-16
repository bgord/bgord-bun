import * as tools from "@bgord/tools";
import type sharp from "sharp";
import * as v from "valibot";
import { DynamicImport } from "./dynamic-import.service";
import type { FileInspectionPort } from "./file-inspection.port";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

export const ImageInfoSharpAdapterError = {
  MissingDependency: "image.info.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileInspection: FileInspectionPort; MimeRegistry: tools.MimeRegistry };
type Sharp = typeof sharp;

export class ImageInfoSharpAdapter implements ImageInfoPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageInfoSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageInfoSharpAdapter> {
    const library = await ImageInfoSharpAdapter.importer.resolve();

    return new ImageInfoSharpAdapter(library.default, deps);
  }

  async inspect(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    const size = await this.deps.FileInspection.size(input);

    const pipeline = this.sharp(input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    const metadata = await pipeline.metadata();

    const width = v.parse(tools.ImageWidth, metadata.width);
    const height = v.parse(tools.ImageHeight, metadata.height);
    const extension = v.parse(tools.Extension, metadata.format);
    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    return { width, height, mime, size };
  }
}
