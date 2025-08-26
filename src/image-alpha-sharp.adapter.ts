import fs from "node:fs/promises";
import sharp from "sharp";
import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";

export class ImageAlphaSharpAdapter implements ImageAlphaPort {
  async flatten(recipe: ImageAlphaStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-flattened"));

    const extension = String(final.getFilename().getExtension());
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline
      .rotate()
      .flatten({ background: recipe.background })
      .toFormat(format)
      .toFile(temporary.get());

    await fs.rename(temporary.get(), final.get());

    return final;
  }
}
