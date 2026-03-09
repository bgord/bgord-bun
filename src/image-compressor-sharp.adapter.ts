import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

export const ImageCompressorSharpAdapterError = {
  MissingDependency: "image.compressor.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageCompressorSharpAdapter implements ImageCompressorPort {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageCompressorSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageCompressorSharpAdapter> {
    const library = await ImageCompressorSharpAdapter.importer.resolve();

    return new ImageCompressorSharpAdapter(library.default, deps);
  }

  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const quality = recipe.quality ?? ImageCompressorSharpAdapter.DEFAULT_QUALITY;

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-compressed"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFormat(format, { quality }).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
