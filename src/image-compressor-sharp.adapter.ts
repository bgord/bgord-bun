import fs from "node:fs/promises";
import sharp from "sharp";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

export class ImageCompressorSharpAdapter implements ImageCompressorPort {
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
    await fs.rename(temporary.get(), final.get());

    return final;
  }
}
