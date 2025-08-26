import fs from "node:fs/promises";
import sharp from "sharp";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

export class ImageFormatterSharpAdapter implements ImageFormatterPort {
  async format(recipe: ImageFormatterStrategy) {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-formatted"));

    const finalExtension = String(final.getFilename().getExtension());
    const encoder = (finalExtension === "jpg" ? "jpeg" : finalExtension) as keyof sharp.FormatEnum;

    const pipeline = sharp((recipe.strategy === "output_path" ? recipe.input : recipe.input).get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.toFormat(encoder).toFile(temporary.get());
    await fs.rename(temporary.get(), final.get());

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await fs.unlink(recipe.input.get());
    }

    return final;
  }
}
