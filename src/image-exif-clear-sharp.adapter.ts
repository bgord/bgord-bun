import fs from "node:fs/promises";
import sharp from "sharp";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

export class ImageExifClearSharpAdapter implements ImageExifClearPort {
  async clear(recipe: ImageExifClearStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-exif-cleared"));

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFile(temporary.get());
    await fs.rename(temporary.get(), final.get());

    return final;
  }
}
