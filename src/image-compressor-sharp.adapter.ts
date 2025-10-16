import sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageCompressorSharpAdapter implements ImageCompressorPort {
  constructor(private readonly deps: Dependencies) {}

  private static readonly DEFAULT_QUALITY = 85;

  async compress(recipe: ImageCompressorStrategy) {
    const quality = recipe.quality ?? ImageCompressorSharpAdapter.DEFAULT_QUALITY;

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-compressed"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFormat(format, { quality }).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
