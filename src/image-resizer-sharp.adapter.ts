import fs from "node:fs/promises";
import sharp from "sharp";
import type {
  ImageResizerInPlaceStrategy,
  ImageResizerOutputPathStrategy,
  ImageResizerPort,
} from "./image-resizer.port";

export class ImageResizerSharpAdapter implements ImageResizerPort {
  async resize(recipe: ImageResizerOutputPathStrategy | ImageResizerInPlaceStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-resized"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline
      .rotate()
      .resize({
        width: recipe.maxSide,
        height: recipe.maxSide,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat(format)
      .toFile(temporary.get());

    await fs.rename(temporary.get(), final.get());

    return final;
  }
}
