import fs from "node:fs/promises";
import sharp from "sharp";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

export class ImageBlurSharpAdapter implements ImageBlurPort {
  async blur(recipe: ImageBlurStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-blurred"));

    const extension = String(final.getFilename().getExtension());
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().blur(recipe.sigma).toFormat(format).toFile(temporary.get());

    await fs.rename(temporary.get(), final.get());

    return final;
  }
}
