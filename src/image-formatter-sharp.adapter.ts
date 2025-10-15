import fs from "node:fs/promises";
import sharp from "sharp";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

type Dependencies = { FileCleaner: FileCleanerPort };

export class ImageFormatterSharpAdapter implements ImageFormatterPort {
  constructor(private readonly deps: Dependencies) {}

  async format(recipe: ImageFormatterStrategy) {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-formatted"));

    const eExtension = final.getFilename().getExtension();
    const encoder = (eExtension === "jpg" ? "jpeg" : eExtension) as keyof sharp.FormatEnum;

    const pipeline = sharp((recipe.strategy === "output_path" ? recipe.input : recipe.input).get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.toFormat(encoder).toFile(temporary.get());
    await fs.rename(temporary.get(), final.get());

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
